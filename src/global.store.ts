import { IAction } from './actions/action.interface';
import { ConsoleLogger } from './common/console.logger';
import { ActionLogger } from './middlewares/action.logger';
import { AbstractLogger as ILogger } from './common/abstract.logger';
import { IGlobalStore } from './common/interfaces/global.store.interface';
import { Store, Reducer, Middleware, createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';

/**
 * Summary Global store for all Apps and container shell (Platform) in Micro-Frontend application.
 * Description Singleton class to be used all all Apps for registering the isolated App States. The platform-level and global-level store can be accessed from this class.
 */
export class GlobalStore implements IGlobalStore {
    public static readonly Platform: string = "Platform";
    public static readonly AllowAll: string = "*";
    public static readonly InstanceName: string = "GlobalStoreInstance";
    public static DebugMode: boolean = false;

    private _stores: { [key: string]: Store };
    private _globalActions: { [key: string]: Array<string> };
    private _globalListeners: Array<(state: any) => void>;
    private _actionLogger: ActionLogger = null;

    private constructor(private _logger: ILogger = null) {
        this._stores = {};
        this._globalActions = {};
        this._globalListeners = [];
        this._actionLogger = new ActionLogger(_logger);
    }

    /**
     * Summary Gets the singleton instance of the Global Store.
     * 
     * @param {ILogger} logger Logger service.
     */
    public static Get(debugMode: boolean = false, logger: ILogger = null): IGlobalStore {
        if(debugMode) {
            this.DebugMode = debugMode;
        }
        if (debugMode && (logger === undefined || logger === null)) {
            logger = new ConsoleLogger(debugMode);
        }
        let globalGlobalStoreInstance: IGlobalStore = window[GlobalStore.InstanceName] || null;
        if (globalGlobalStoreInstance === undefined || globalGlobalStoreInstance === null) {
            globalGlobalStoreInstance = new GlobalStore(logger);
            window[GlobalStore.InstanceName] = globalGlobalStoreInstance;
        }
        return globalGlobalStoreInstance;
    }

    /**
     * Summary: Creates and registers a new store
     * 
     * @access public
     * 
     * @param {string} appName Name of the App for whom the store is getting creating.
     * @param {Reducer} appReducer The root reducer of the App. If partner app is using multiple reducers, then partner App must use combineReducer and pass the root reducer
     * @param {Array<Middleware>} middlewares List of redux middlewares that the partner app needs.
     * @param {boolean} shouldReplaceStore Flag to indicate if the Partner App wants to replace an already created/registered store with the new store.
     * @param {boolean} shouldReplaceReducer Flag to indicate if the Partner App wants to replace the existing root Reducer with the given reducer. Note, that the previous root Reducer will be replaced and not updated. If the existing Reducer needs to be used, then partner app must do the append the new reducer and pass the combined root reducer.
     * 
     * @returns {Store<any, any>} The new Store
     */
    CreateStore(appName: string, appReducer: Reducer, middlewares?: Array<Middleware>, globalActions?: Array<string>, shouldReplaceStore: boolean = false, shouldReplaceReducer: boolean = false): Store<any, any> {
        let existingStore = this._stores[appName];
        if (existingStore === null || existingStore === undefined || shouldReplaceStore) {
            if (middlewares === undefined || middlewares === null)
                middlewares = [];
            let appStore = createStore(appReducer, GlobalStore.DebugMode ? composeWithDevTools( applyMiddleware(...middlewares)) : applyMiddleware(...middlewares));
            this.RegisterStore(appName, appStore, globalActions, shouldReplaceStore);
            return appStore;
        }

        if (shouldReplaceReducer) {
            console.warn(`The reducer for ${appName} is getting replaced`);
            existingStore.replaceReducer(appReducer);
            this.RegisterStore(appName, existingStore, globalActions, true);
        }
        return existingStore;
    }

    /**
     * Summary: Registers an isolated app store
     * 
     * @access public
     * 
     * @param {string} appName Name of the App.
     * @param {Store} store Instance of the store.
     * @param {boolean} shouldReplace Flag to indicate if the an already registered store needs to be replaced.
     */
    RegisterStore(appName: string, store: Store, globalActions?: Array<string>, shouldReplaceExistingStore: boolean = false): void {
        let existingStore = this._stores[appName];
        if (existingStore !== undefined && existingStore !== null && shouldReplaceExistingStore === false)
            return;

        this._stores[appName] = store;
        store.subscribe(this.InvokeGlobalListeners.bind(this));
        this.RegisterGlobalActions(appName, globalActions);
        this.LogRegistration(appName, (existingStore !== undefined && existingStore !== null));
    }

    /**
     * Summary: Registers a list of actions for an App that will be made Global.
     * Description: Global actions can be dispatched on the App Store by any Partner Apps. If partner needs to make all actions as Global, then pass "*" in the list. If no global actions are registered then other partners won't be able to dispatch any action on the App Store.
     * 
     * @access public
     * 
     * @param {string} appName Name of the app.
     * @param {Array<string>} actions List of global action names.
     */
    RegisterGlobalActions(appName: string, actions?: Array<string>): void {
        if (actions === undefined || actions === null || actions.length === 0) {
            return;
        }

        let registeredActions = this._globalActions[appName];
        if (registeredActions === undefined || registeredActions === null) {
            registeredActions = [];
            this._globalActions[appName] = [];
        }
        let uniqueActions = actions.filter(action => registeredActions.find(registeredAction => action === registeredAction) === undefined);
        uniqueActions = [...new Set(uniqueActions)]; // Removing any duplicates
        this._globalActions[appName] = [...this._globalActions[appName], ...uniqueActions];
    }

    /**
     * Summary: Gets the current state of the Platform
     * 
     * @access public
     * 
     * @returns Current Platform State (App with name Platform)
     */
    GetPlatformState(): any {
        let platformStore = this.GetPlatformStore();
        if (platformStore === undefined || platformStore === null)
            return null;
        return this.CopyState(platformStore.getState());
    }

    /**
     * Summary: Gets the current state of the given Partner.
     * Description: A read-only copy of the Partner state is returned. The state cannot be mutated using this method. For mutation dispatch actions. In case the partner hasn't been registered or the partner code hasn't loaded, the method will return null.
     * 
     * @param partnerName Name of the partner whose state is needed
     * 
     * @returns {any} Current partner state.
     */
    GetPartnerState(partnerName: string): any {
        let partnerStore = this.GetPartnerStore(partnerName);
        if (partnerStore === undefined || partnerStore === null)
            return null;
        let partnerState = partnerStore.getState();
        return this.CopyState(partnerState);
    }

    /**
     * Summary: Gets the global store.
     * Description: The global store comprises of the states of all registered partner's state.
     * Format
     * {
     *      Platform: { ...Platform_State },
     *      Partner_Name_1: { ...Partner_1_State },
     *      Partner_Name_2: { ...Partner_2_State }
     * }
     * 
     * @access public 
     * 
     * @returns {any} Global State.
     */
    GetGlobalState(): any {
        let globalState = {};
        for (let partner in this._stores) {
            let state = this._stores[partner].getState();
            globalState[partner] = state;
        };
        return this.CopyState(globalState);
    }

    /**
     * Summary: Dispatches an action on all the Registered Store (including Platform level store).
     * Description: The action will be dispatched only if the Partner App has declated the action to be global at it's store level.
     * 
     * @access public
     * 
     * @param {string} source Name of app dispatching the Actions
     * @param {IAction<any>} action Action to be dispatched
     */
    DispatchGlobalAction(source: string, action: IAction<any>): void {
        for (let partner in this._stores) {
            let isActionRegisteredByPartner = this.IsActionRegisteredAsGlobal(partner, action);
            if (isActionRegisteredByPartner) {
                this._stores[partner].dispatch(action);
            }
        }
    }

    /**
     * Summary: Dispatched an action of the local store
     * 
     * @access public
     * 
     * @param {string} source Name of app dispatching the Actions
     * @param {IAction<any>} action Action to be dispatched
     */
    DispatchLocalAction(source: string, action: IAction<any>): void {
        let localStore = this._stores[source];
        if (localStore === undefined || localStore === null) {
            let error = new Error(`Store is not registered`);
            if (this._logger !== undefined && this._logger !== null)
                this._logger.LogException(source, error, {});
            throw error;
        }
        localStore.dispatch(action);
    }

    /**
     * Summary: Dispatches an action at a local as well global level
     * 
     * @access public
     * 
     * @param {string} source Name of app dispatching the Actions
     * @param {IAction<any>} action Action to be dispatched
     */
    DispatchAction(source: string, action: IAction<any>): void {
        this.DispatchGlobalAction(source, action);

        let isActionGlobal = this.IsActionRegisteredAsGlobal(source, action);
        if (!isActionGlobal)
            this.DispatchLocalAction(source, action);
    }

    /**
     * Summary: Subscribe to current store's state changes
     * 
     * @param {string} source Name of the application
     * @param {(state: any) => void} callback Callback method to be invoked when state changes
     */
    Subscribe(source: string, callback: (state: any) => void): () => void {
        let store = this.GetPartnerStore(source);
        if (store === undefined || store === null) {
            throw new Error(`ERROR: Store for ${source} hasn't been registered`);
        }
        return store.subscribe(() => callback(store.getState()));
    }

    /**
     * Summary: Subscribe to any change in the Platform's state.
     * 
     * @param {string} source Name of application subscribing to the state changes.
     * @param {(state: any) => void} callback Callback method to be called for every platform's state change.
     * 
     * @returns {() => void} Unsubscribe method. Call this method to unsubscribe to the changes.
     */
    SubscribeToPlatformState(source: string, callback: (state: any) => void): () => void {
        let platformStore = this.GetPlatformStore();
        return platformStore.subscribe(() => callback(platformStore.getState()));
    }

    /**
     * Summary: Subscribe to any change in the Partner App's state.
     * 
     * @access public
     * 
     * 
     * @param {string} source Name of the application subscribing to the state changes.
     * @param {string} partner Name of the Partner application to whose store is getting subscribed to.
     * @param {(state: any) => void} callback Callback method to be called for every partner's state change.
     * 
     * @throws Error when the partner is yet to be registered/loaded or partner doesn't exist.
     * 
     * @returns {() => void} Unsubscribe method. Call this method to unsubscribe to the changes.
     */
    SubscribeToPartnerState(source: string, partner: string, callback: (state: any) => void): () => void {
        let partnerStore = this.GetPartnerStore(partner);
        if (partnerStore === undefined || partnerStore === null) {
            throw new Error(`ERROR: ${source} is trying to subscribe to partner ${partner}. Either ${partner} doesn't exist or hasn't been loaded yet`);
        }
        return partnerStore.subscribe(() => callback(partnerStore.getState()));
    }

    /**
     * Summary: Subscribe to any change in the Global State, including Platform-level and Partner-level changes.
     * 
     * @access public
     * 
     * @param {string} source Name of the application subscribing to the state change.
     * @param {(state: any) => void} callback Callback method to be called for every any change in the global state.
     * 
     * @returns {() => void} Unsubscribe method. Call this method to unsubscribe to the changes.
     */
    SubscribeToGlobalState(source: string, callback: (state: any) => void): () => void {
        this._globalListeners.push(callback)
        return () => {
            this._globalListeners = this._globalListeners.filter(globalListener => globalListener !== callback);
        }
    }

    SetLogger(logger: ILogger) {
        if (this._logger === undefined || this._logger === null)
            this._logger = logger;
        else
            this._logger.SetNextLogger(logger);
        this._actionLogger.SetLogger(logger);
    }

    private InvokeGlobalListeners(): void {
        let globalState = this.GetGlobalState();
        this._globalListeners.forEach(globalListener => {
            globalListener(globalState);
        });
    }

    private GetPlatformStore(): Store<any, any> {
        return this.GetPartnerStore(GlobalStore.Platform);
    }

    private GetPartnerStore(partnerName: string): Store<any, any> {
        return this._stores[partnerName];
    }

    private GetGlobalMiddlewares(): Array<Middleware> {
        let actionLoggerMiddleware = this._actionLogger.CreateMiddleware();
        return [actionLoggerMiddleware];
    }

    private IsActionRegisteredAsGlobal(appName: string, action: IAction<any>): boolean {
        let registeredGlobalActions = this._globalActions[appName];
            if (registeredGlobalActions === undefined || registeredGlobalActions === null) {
                return false;
            }
        return registeredGlobalActions.some(registeredAction => registeredAction === action.type || registeredAction === GlobalStore.AllowAll);
    }

    private LogRegistration(appName: string, isReplaced: boolean) {
        try {
            let properties = {
                "AppName": appName,
                "IsReplaced": isReplaced.toString()
            };
            if (this._logger)
                this._logger.LogEvent("Store.GlobalStore", "StoreRegistered", properties);
        }
        catch (error) {
            // Gulp the error
            console.error(`ERROR: There was an error while logging registration for ${appName}`);
            console.error(error);
        }
    }

    private CopyState(state: any) {
        if (state === undefined || state === null || typeof state !== 'object') {
            return state;
        } else {
            return {
                ...state
            }
        }
    }
}