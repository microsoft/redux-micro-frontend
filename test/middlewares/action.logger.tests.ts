import { IAction } from '../../src/actions/action.interface';
import { createStore, Reducer, applyMiddleware } from 'redux';
import { ActionLogger } from '../../src/middlewares/action.logger';
import { AbstractLogger as ILogger } from '../../src/common/abstract.logger';

describe("ActionLoggerMiddleware", () => {
    let mockLogger = {
        LogEvent: function (source, event, properties) { },
        LogException: function (source, exception, properties) { }
    } as ILogger;

    it("Should get created", () => {
        expect(new ActionLogger(mockLogger)).toBeDefined();
    });

    it("Should log action start and action end", () => {
        // Arrange
        spyOn(mockLogger, "LogEvent").and.callThrough();
        let reducer: Reducer<any, any> = (state = null, action: IAction<any>): any => {
            return action.payload;
        };
        let middleware = new ActionLogger(mockLogger).CreateMiddleware();
        let store = createStore(reducer, applyMiddleware(middleware));

        // Act
        store.dispatch({
            type: "Action",
            payload: "Dummy",
            logEnabled: true
        } as IAction<any>);

        // Assert
        expect(mockLogger.LogEvent).toHaveBeenCalledTimes(2);
    });

    it("Should log action start and action failure", () => {
        // Arrange
        spyOn(mockLogger, "LogEvent").and.callThrough();
        spyOn(mockLogger, "LogException").and.callThrough();
        let dummyError = new Error("Dummy Error");
        let reducer: Reducer<any, any> = (state = null, action: IAction<any>): any => {
            if (action.type === "FaultAction") {
                throw dummyError;
            }
            return state;
        };
        let middleware = new ActionLogger(mockLogger).CreateMiddleware();
        let store = createStore(reducer, applyMiddleware(middleware));

        // Act
        try {
            store.dispatch({
                type: "FaultAction",
                payload: "Dummy",
                logEnabled: true
            });
            expect(true).toBeFalsy(); // Control should not come here
        }
        catch (error) {
            // Assert
            expect(error.message).toBe(dummyError.message);
            expect(mockLogger.LogEvent).toHaveBeenCalledTimes(2);
            expect(mockLogger.LogException).toHaveBeenCalledTimes(1);
        }
    });

    it("Should not throw exception when logger fails", () => {
        // Arrange
        spyOn(mockLogger, "LogEvent").and.throwError("Some dummy error");
        let reducer: Reducer<any, any> = (state = null, action: IAction<any>): any => {
            return action.payload;
        };
        let middleware = new ActionLogger(mockLogger).CreateMiddleware();
        let store = createStore(reducer, applyMiddleware(middleware));

        // Act
        store.dispatch({
            type: "Action",
            payload: "Dummy",
            logEnabled: true
        });

        // Assert
        expect(mockLogger.LogEvent).toHaveBeenCalledTimes(2);
    });
});