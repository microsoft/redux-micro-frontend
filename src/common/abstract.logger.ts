/**
 * Summary Logs data from application. Follows a Chain of Responsibility pattern where multiple loggers can be chained.
 */
export abstract class AbstractLogger {
    LoggerIdentity: String;
    NextLogger: AbstractLogger;

    constructor(id: string) {
        this.LoggerIdentity = id;
    }

    /**
     * Summary Logs an event
     * @param source Location from where the log is sent
     * @param eventName Name of the event that has occurred
     * @param properties Properties (KV pair) associated with the event
     */
    LogEvent(source: string, eventName: string, properties: any) {
        try {
            this.processEvent(source, eventName, properties);
            if (this.NextLogger !== undefined && this.NextLogger !== null) {
                this.NextLogger.LogEvent(source, eventName, properties);
            }
        }
        catch {
            // DO NOT THROW AN EXCEPTION WHEN LOGGING FAILS
        }
    }

    /**
     * Summary Logs an error in the system
     * @param source Location where the error has occurred
     * @param error Error
     * @param properties Custom properties (KV pair)
     */
    LogException(source: string, error: Error, properties: any) {
        try {
            this.processException(source, error, properties);
            if (this.NextLogger !== undefined && this.NextLogger !== null) {
                this.NextLogger.LogException(source, error, properties);
            }
        }
        catch {
            // DO NOT THROW AN EXCEPTION WHEN LOGGING FAILS
        }
    }

    /**
     * Summary Sets the next logger in the chain. If the next logger is already filled then its chained to the last logger of the chain
     * @param nextLogger Next Logger to be set in the chain
     */
    SetNextLogger(nextLogger: AbstractLogger) {
        if (nextLogger === undefined || nextLogger === null)
            return;
        if (!this.isLoggerLoopCreated(nextLogger)) {
            if (this.NextLogger === undefined || this.NextLogger === null) {
                this.NextLogger = nextLogger;
            } else {
                this.NextLogger.SetNextLogger(nextLogger);
            }
        }
    }

    private isLoggerLoopCreated(nextLogger: AbstractLogger) {
        let tmpLogger = {...nextLogger};
        do {
            if (tmpLogger.LoggerIdentity === this.LoggerIdentity)
                return true;
            tmpLogger = tmpLogger.NextLogger;
        } while (tmpLogger !== null && tmpLogger !== undefined)
        return false;
    }

    abstract processEvent(source: string, eventName: string, properties: any);
    abstract processException(source, error: Error, properties: any);
}
