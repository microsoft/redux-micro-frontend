import { createStore, Reducer } from 'redux';
import { GlobalStore } from '../src/global.store';
import { IAction } from '../src/actions/action.interface';
import { AbstractLogger as ILogger } from '../src/common/abstract.logger';

describe("Global Store", () => {
    let mockLogger = {
        LogEvent: function (source, event, properties) { },
        LogException: function (source, error, properties) { }
    } as ILogger;

    beforeEach(() => {
        spyOn(mockLogger, "LogEvent").and.callThrough();
    });

    let globalStore = GlobalStore.Get(true, mockLogger);

    it("Should get created", () => {
        expect(globalStore).toBeDefined();
    });

    it("Should get created as a singleton", () => {
        let globalStoreDuplicate = GlobalStore.Get();
        expect(globalStore).toBe(globalStoreDuplicate);
    });

    it("Should get created with Platform State", () => {
        expect((<any>globalStore)._stores).toBeDefined();
    });

    describe("CreateStore", () => {
        let dummyPartnerReducer: Reducer<any, any> = (state: any = {}, action) => {
            return state;
        };

        it("Should create a new partner store without custom middlewares and no global actions", () => {
            // Arrange
            let partnerAppName = "SamplePartner_1";

            // Act
            let store = globalStore.CreateStore(partnerAppName, dummyPartnerReducer, []);

            // Assert
            expect(store).toBeDefined();
            expect((<any>globalStore)._stores).toBeDefined();
            expect((<any>globalStore)._stores[partnerAppName]).toBeDefined();
        });

        it("Should re-register partner store when ShouldReplace is true", () => {
            // Arrange
            let partnerAppName = "SamplePartner_1";

            // Act
            let store = globalStore.CreateStore(partnerAppName, dummyPartnerReducer, [], null, true);

            // Assert
            expect(store).toBeDefined();
            expect((<any>globalStore)._stores).toBeDefined();
            expect((<any>globalStore)._stores[partnerAppName]).toBeDefined();
            expect(mockLogger.LogEvent).toHaveBeenCalled();
        });


        it("Should replace partner reducer when ShouldUpdate is true", () => {
            // Arrange
            let partnerAppName = "SamplePartner_1";

            // Act
            let store = globalStore.CreateStore(partnerAppName, dummyPartnerReducer, [], null, false, true);

            // Assert
            expect(store).toBeDefined();
            expect((<any>globalStore)._stores).toBeDefined();
            expect((<any>globalStore)._stores[partnerAppName]).toBeDefined();

            expect(mockLogger.LogEvent).toHaveBeenCalled();
            expect(mockLogger.LogEvent).toHaveBeenCalledTimes(1);
        });

        it("Should not re-register partner store when ShouldReplace is false", () => {
            // Arrange
            let partnerAppName = "SamplePartner_2";
            let store = globalStore.CreateStore(partnerAppName, dummyPartnerReducer, [], null, true);

            // Act
            store = globalStore.CreateStore(partnerAppName, dummyPartnerReducer, [], null, false);

            // Assert
            expect(store).toBeDefined();
            expect((<any>globalStore)._stores).toBeDefined();
            expect((<any>globalStore)._stores[partnerAppName]).toBeDefined();
            expect(mockLogger.LogEvent).toHaveBeenCalled();
            expect(mockLogger.LogEvent).toHaveBeenCalledTimes(1);
        });
    });

    describe("RegisterGlobalActions", () => {
        it("Should register global actions for a new partner", () => {
            // Arrange
            let partnerAppName = "SamplePartner-1";
            let partnerGlobalActions = ["ga-1", "ga-2"];

            // Act
            globalStore.RegisterGlobalActions(partnerAppName, partnerGlobalActions);

            // Assert
            expect((<any>globalStore)._globalActions).toBeDefined();
            expect((<any>globalStore)._globalActions[partnerAppName]).toBeDefined();
            let registeredActions = ((<any>globalStore)._globalActions[partnerAppName] as string[]);
            registeredActions.forEach(registeredAction => {
                expect(partnerGlobalActions.some(action => action === registeredAction)).toBeTruthy();
            })
        });

        it("Should not register global actions for a new partner when actions is null", () => {
            // Arrange
            let partnerAppName = "SamplePartner-2";

            // Act
            globalStore.RegisterGlobalActions(partnerAppName, null);

            // Assert
            expect((<any>globalStore)._globalActions).toBeDefined();
            expect((<any>globalStore)._globalActions[partnerAppName]).toBeUndefined();
        });

        it("Should not register global actions for a new partner when actions is empty", () => {
            // Arrange
            let partnerAppName = "SamplePartner-3";

            // Act
            globalStore.RegisterGlobalActions(partnerAppName, []);

            // Assert
            expect((<any>globalStore)._globalActions).toBeDefined();
            expect((<any>globalStore)._globalActions[partnerAppName]).toBeUndefined();
        });

        it("Should not register already registered global actions for a partner", () => {
            // Arrange
            let partnerAppName = "SamplePartner-4";
            let duplicateActionName = "ga-2";
            let partnerGlobalActions_1 = ["ga-1", duplicateActionName];
            let partnerGlobalActions_2 = [duplicateActionName, "ga-3"];

            // Act
            globalStore.RegisterGlobalActions(partnerAppName, partnerGlobalActions_1);
            globalStore.RegisterGlobalActions(partnerAppName, partnerGlobalActions_2);

            // Assert
            expect((<any>globalStore)._globalActions).toBeDefined();
            expect((<any>globalStore)._globalActions[partnerAppName]).toBeDefined();
            let registeredActions = ((<any>globalStore)._globalActions[partnerAppName] as string[]);
            expect(registeredActions.length).toBe(3);
            expect(registeredActions.filter(a => a === duplicateActionName).length).toBe(1);
        });

        it("Should not register duplicate global actions for a partner", () => {
            // Arrange
            let partnerAppName = "SamplePartner-4";
            let duplicateActionName = "ga-2";
            let partnerGlobalActions = ["ga-1", duplicateActionName, duplicateActionName, duplicateActionName, "ga-3"];

            // Act
            globalStore.RegisterGlobalActions(partnerAppName, partnerGlobalActions);

            // Assert
            expect((<any>globalStore)._globalActions).toBeDefined();
            expect((<any>globalStore)._globalActions[partnerAppName]).toBeDefined();
            let registeredActions = ((<any>globalStore)._globalActions[partnerAppName] as string[]);
            expect(registeredActions.length).toBe(3);
            expect(registeredActions.filter(a => a === duplicateActionName).length).toBe(1);
        });
    });

    describe("GetPlatformState", () => {
        it("Should return Platform state", () => {
            // Act
            let platformState = globalStore.GetPlatformState();

            // Assert
            expect(platformState).toBeDefined();
        })
    });

    describe("GetPartnerState", () => {
        let dummyPartnerReducer: Reducer<any, any> = (state: string = null, action) => {
            return action.payload;
        };

        it("Should return Partner state", () => {
            // Arrange
            let partnerAppName = "SamplePartner-10";
            globalStore.CreateStore(partnerAppName, dummyPartnerReducer, [], [GlobalStore.AllowAll], false, false);
            let actionText = "ACTION!!!";

            // Act
            globalStore.DispatchGlobalAction("TEST",
                {
                    type: "Sample",
                    payload: actionText
                });
            let partnerState = globalStore.GetPartnerState(partnerAppName);

            // Assert
            expect(partnerState).toBeDefined();
            expect(partnerState).toBe(actionText);
        });

        it("Should not return Partner state when partner is not registered", () => {
            // Arrange
            let partnerAppName = "SamplePartner-11";

            // Act
            let partnerState = globalStore.GetPartnerState(partnerAppName);

            // Assert
            expect(partnerState).toBeNull();
        });
    });

    describe("GetGlobalState", () => {
        let dummyPartnerReducer: Reducer<any, any> = (state: string = null, action) => {
            return action.payload;
        };

        it("Should formulate global state", () => {
            // Arrange
            let partnerAppName = "SamplePartner-20";
            globalStore.CreateStore(partnerAppName, dummyPartnerReducer, [], [GlobalStore.AllowAll], false, false);
            let actionText = "ACTION!!!";

            // Act
            globalStore.DispatchGlobalAction("TEST",
                {
                    type: "Sample",
                    payload: actionText
                });
            let partnerState = globalStore.GetGlobalState();

            // Assert
            expect(partnerState).toBeDefined();
            expect(partnerState[partnerAppName]).toBeDefined();
            expect(partnerState[partnerAppName]).toBe(actionText);
        });
    });

    describe("DispatchGlobalAction", () => {
        let dummyPartnerReducer: Reducer<any, any> = (state: string = "Default", action: IAction<any>) => {
            switch (action.type) {
                case "Local": return "Local";
                case "Global": return "Global";
            }

        };

        it("Should dispatch globally registered action on a partner store", () => {
            // Arrange
            let partnerAppName = "SamplePartner-30";
            globalStore.CreateStore(partnerAppName, dummyPartnerReducer, [], ["Global"], false, false);

            // Act
            globalStore.DispatchGlobalAction("Test",
                {
                    type: "Global",
                    payload: null
                });
            let partnerState = globalStore.GetGlobalState();

            // Assert
            expect(partnerState).toBeDefined();
            expect(partnerState[partnerAppName]).toBeDefined();
            expect(partnerState[partnerAppName]).toBe("Global");
        });

        it("Should not dispatch non-globally registered action on a partner store", () => {
            // Arrange
            let partnerAppName = "SamplePartner-31";
            globalStore.CreateStore(partnerAppName, dummyPartnerReducer, [], ["Global"], false, false);

            // Act
            globalStore.DispatchGlobalAction("Test",
                {
                    type: "Local",
                    payload: null
                });
            let partnerState = globalStore.GetGlobalState();

            // Assert
            expect(partnerState).toBeDefined();
            expect(partnerState[partnerAppName]).toBeUndefined();
        });
    });

    describe("SubscribeToPartnerState", () => {
        let dummyPartnerReducer: Reducer<any, any> = (state: string = "Default", action: IAction<any>) => {
            switch (action.type) {
                case "Local": return "Local";
                case "Global": return "Global";
            }

        };

        it("Should invoke callback when partner state changes", () => {
            // Arrange
            let partnerAppName = "SamplePartner-40";
            let isPartnerStateChanged = false;
            globalStore.CreateStore(partnerAppName, dummyPartnerReducer, [], ["Global"], false, false);

            // Act
            globalStore.SubscribeToPartnerState("Test", partnerAppName, (state) => {
                isPartnerStateChanged = true;
            });
            globalStore.DispatchGlobalAction("Test",
                {
                    type: "Global",
                    payload: null
                });


            // Assert
            expect(isPartnerStateChanged).toBeTruthy();
        });

        it("Should allow registering to non-registered store in eager mode", () => {
            // Arrange
            let partnerAppName = "SamplePartner-100";

            // Act
            let exceptionThrown = false;
            try {
                globalStore.SubscribeToPartnerState("Test", partnerAppName, (state) => { }, true);
            } catch {
                exceptionThrown = true;
            }

            // Assert
            expect(exceptionThrown).not.toBeTruthy();
        });

        it("Should throw exception when registering to non-registered store in non-eager mode", () => {
            // Arrange
            let partnerAppName = "SamplePartner-101";

            // Act
            let exceptionThrown = false;
            try {
                globalStore.SubscribeToPartnerState("Test", partnerAppName, (state) => { }, false);
            } catch {
                exceptionThrown = true;
            }

            // Assert
            expect(exceptionThrown).toBeTruthy();
        });

        it("Should attach eager subscriber", () => {
            // Arrange
            let partnerAppName = "SamplePartner-102";
            let isPartnerStateChanged = false;
            
            // Act
            globalStore.SubscribeToPartnerState("Test", partnerAppName, (state) => {
                isPartnerStateChanged = true;
            }, true);

            globalStore.CreateStore(partnerAppName, dummyPartnerReducer, [], ["Global"], false, false);
            globalStore.DispatchGlobalAction("Test",
                {
                    type: "Global",
                    payload: null
                });


            // Assert
            expect(isPartnerStateChanged).toBeTruthy();
        });

        it("Should attach eager multiple subscribers", () => {
            // Arrange
            let partnerAppName_1 = "SamplePartner-112";
            let isPartnerStateChanged_1 = false;

            let partnerAppName_2 = "SamplePartner-114";
            let isPartnerStateChanged_2 = false;
            
            // Act
            globalStore.SubscribeToPartnerState("Test", partnerAppName_1, (state) => {
                isPartnerStateChanged_1 = true;
            }, true);

            globalStore.SubscribeToPartnerState("Test", partnerAppName_2, (state) => {
                isPartnerStateChanged_2 = true;
            }, true);

            globalStore.CreateStore(partnerAppName_1, dummyPartnerReducer, [], ["Global"], false, false);
            globalStore.CreateStore(partnerAppName_2, dummyPartnerReducer, [], ["Global"], false, false);
            globalStore.DispatchGlobalAction("Test",
                {
                    type: "Global",
                    payload: null
                });


            // Assert
            expect(isPartnerStateChanged_1).toBeTruthy();
            expect(isPartnerStateChanged_2).toBeTruthy();
        });
    });

    describe("SubscribeToGlobalState", () => {
        let dummyPartnerReducer: Reducer<any, any> = (state: string = "Default", action: IAction<any>) => {
            switch (action.type) {
                case "Local": return "Local";
                case "Global": return "Global";
            }
        };

        it("Should invoke callback when global state changes due to partner change", () => {
            // Arrange
            let partnerAppName = "SamplePartner-40";
            let isGlobalStateChanged = false;
            globalStore.CreateStore(partnerAppName, dummyPartnerReducer, [], ["Global"], false, false);

            // Act
            globalStore.SubscribeToGlobalState("Test", (state) => {
                isGlobalStateChanged = true;
            });
            globalStore.DispatchGlobalAction("Test",
                {
                    type: "Global",
                    payload: null
                });


            // Assert
            expect(isGlobalStateChanged).toBeTruthy();
        });

        it("Should invoke callback when global state changes due to partner change - CreateStore", () => {
            // Arrange
            let partnerAppName = "SamplePartner-40";
            let isGlobalStateChanged = false;
            let store = globalStore.CreateStore(partnerAppName, dummyPartnerReducer, [], ["Global"], false, false);

            // Act
            globalStore.SubscribeToGlobalState("Test", (state) => {
                isGlobalStateChanged = true;
            });
            store.dispatch(
                {
                    type: "Global",
                    payload: null
                });


            // Assert
            expect(isGlobalStateChanged).toBe(true);
        });

        it("Should invoke callback when global state changes due to partner change - ResigerStore", () => {
            // Arrange
            let partnerAppName = "SamplePartner-41";
            let isGlobalStateChanged = false;
            let store = createStore(dummyPartnerReducer);
            globalStore.RegisterStore(partnerAppName, store, ["Global"], false);

            // Act
            globalStore.SubscribeToGlobalState("Test", (state) => {
                isGlobalStateChanged = true;
            });
            store.dispatch(
                {
                    type: "Global",
                    payload: null
                });


            // Assert
            expect(isGlobalStateChanged).toBe(true);
        });
    });
});