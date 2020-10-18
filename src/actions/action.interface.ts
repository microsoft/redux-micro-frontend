export interface IAction<Payload = any> {
    type: string,
    payload: Payload,
    logEnabled?: Boolean
}