import { Middleware } from 'redux';
import { stringify } from 'flatted';
import { IAction } from '../actions';
import { AbstractLogger as ILogger } from '../common/abstract.logger';

/**
 * Summary Logs action and its impact on the state
 */
export class ActionLogger {

    constructor(private _logger: ILogger) { }

    /**
     * Summary Creates as Redux middleware for logging the actions and its impact on the State
     */
    public CreateMiddleware(): Middleware {
        return store => next => (action: IAction<any>) => {
            if (!this.IsLoggingAllowed(action)) {
                return next(action);
            }

            const dispatchedAt = new Date();
            let state = store.getState();
            this.LogActionDispatchStart(state, action);
            let dispatchResult: IAction<any> = null;
            try {
                dispatchResult = next(action);
            } catch (error) {
                this.LogActionDispatchFailure(action, dispatchedAt, error);
                throw error;
            }
            state = store.getState();
            this.LogActionDispatchComplete(state, action, dispatchedAt);
            return dispatchResult;
        }
    }

    public SetLogger(logger: ILogger) {
        if (this._logger === undefined || this._logger === null)
            this._logger = logger;
        else
            this._logger.SetNextLogger(logger);
    }

    private IsLoggingAllowed(action: IAction) {
        return action.logEnabled !== undefined
            && action.logEnabled !== null
            && action.logEnabled === true
            && this._logger !== undefined
            && this._logger !== null;
    }

    private LogActionDispatchStart(state: any, action: IAction<any>) {
        try {
            var properties = {
                "OldState": stringify(state),
                "ActionName": action.type,
                "DispatchStatus": "Dispatched",
                "DispatchedOn": new Date().toISOString(),
                "Payload": stringify(action.payload)
            };
            this._logger.LogEvent("Fxp.Store.ActionLogger", `${action.type} :: DISPATCHED`, properties);
        }
        catch (error) {
            // Gulp the error
            console.error("ERROR: There was an error while trying to log the Dispatch Complete event");
            console.error(error);
        }
    }

    private LogActionDispatchComplete(state: any, action: any, dispatchedAt: Date) {
        try {
            let currentTime = new Date();
            const timeTaken = currentTime.getTime() - dispatchedAt.getTime();
            var properties = {
                "NewState": stringify(state),
                "ActionName": action.type,
                "DispatchStatus": "Completed",
                "DispatchedOn": new Date().toISOString(),
                "Payload": stringify(action.payload),
                "TimeTaken": timeTaken.toString()
            };
            this._logger.LogEvent("Fxp.Store.ActionLogger", `${action.type} :: COMPLETED`, properties);
        }
        catch (error) {
            // Gulp the error
            console.error("ERROR: There was an error while trying to log the Dispatch Complete event");
            console.error(error);
        }
    }

    private LogActionDispatchFailure(action: any, dispatchedAt: Date, exception: Error) {
        try {
            let currentTime = new Date();
            const timeTaken = currentTime.getTime() - dispatchedAt.getTime();
            var properties = {
                "ActionName": action.type,
                "DispatchStatus": "Failed",
                "DispatchedOn": new Date().toISOString(),
                "Payload": stringify(action.payload),
                "TimeTaken": timeTaken.toString()
            };
            this._logger.LogEvent("Fxp.Store.ActionLogger", `${action.type} :: FAILED`, properties);
            this._logger.LogException("Fxp.Store.ActionLogger", exception, properties);
            console.error(exception);
        }
        catch (error) {
            // Gulp the error
            console.error("ERROR: There was an error while trying to log the Dispatch Failure event");
            console.error(error);
        }
    }
}