import { AbstractLogger } from "./abstract.logger";

export class ConsoleLogger extends AbstractLogger {
    constructor(private _debugMode: boolean = false) {
        super("DEFAULT_CONSOLE_LOGGER");
        this.NextLogger = null;
    }

    processEvent(source: string, eventName: string, properties: any) {
        try {
            if (!this._debugMode)
                return;
            console.log(`EVENT : ${eventName}. (${source})`);
        } catch {
            // DO NOT THROW AN EXCEPTION WHEN LOGGING FAILS
        }
    }

    processException(source: string, error: Error, properties: any) {
        try {
            if (!this._debugMode)
                return;
            console.error(error);
        } catch {
            // DO NOT THROW AN EXCEPTION WHEN LOGGING FAILS
        }
    }
}