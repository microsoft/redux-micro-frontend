import { Store, Middleware, Reducer } from "redux";
import { IAction } from "../../actions/action.interface";
import { AbstractLogger as ILogger } from "../abstract.logger";

export interface IGlobalStore {
    CreateStore(appName: string, appReducer: Reducer, middlewares?: Array<Middleware>, globalActions?: Array<string>, shouldReplaceStore?: boolean, shouldReplaceReducer?: boolean): Store<any, any>;
    RegisterStore(appName: string, store: Store, globalActions?: Array<string>, shouldReplaceStore?: boolean): void
    RegisterGlobalActions(appName: string, actions: Array<string>): void;

    GetPlatformState(): any;
    GetPartnerState(partnerName: string): any;
    GetGlobalState(): any;

    DispatchGlobalAction(source: string, action: IAction<any>): void;
    DispatchLocalAction(source: string, action: IAction<any>): void;
    DispatchAction(source: string, action: IAction<any>): void;

    Subscribe(source: string, callback: (state: any) => void): () => void;
    SubscribeToPlatformState(source: string, callback: (state: any) => void): () => void;
    SubscribeToPartnerState(source: string, partner: string, callback: (state: any) => void): () => void;
    SubscribeToPartnerState(source: string, partner: string, callback: (state: any) => void, eager: boolean): () => void;
    SubscribeToGlobalState(source: string, callback: (state: any) => void): () => void;

    ExposeDerivedState(source: string, api: Record<string, any>, mergeApi?: boolean): void;
    SelectPartnerDerivedState(partner: string, interestedDerivedState: string, defaultReturn?: any): any;

    SetLogger(logger: ILogger): void;
};