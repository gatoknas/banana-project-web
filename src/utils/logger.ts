/**
 * Standard Telemetry & Logging Utility for Banana Project Web
 * Formats client logs to the shared Grafana/Loki JSON schema and manages trace propagation.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface TelemetryLogPayload {
  timestamp: string;
  level: LogLevel;
  service: string;
  env: string;
  version: string;
  trace_id: string;
  session_id?: string;
  user_id?: string;
  event: string;
  message: string;
  client?: {
    user_agent: string;
    url: string;
    screen: string;
    language: string;
  };
  error?: {
    type?: string;
    message: string;
    stack?: string;
  };
  context?: Record<string, unknown>;
}

// Generate or retrieve session ID
const getSessionId = (): string => {
  try {
    let sid = sessionStorage.getItem('bp_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      sessionStorage.setItem('bp_session_id', sid);
    }
    return sid;
  } catch {
    return 'sess_fallback';
  }
};

// Generate a random UUID v4 trace ID
export const generateTraceId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

class ClientLogger {
  private service = 'banana-project-web';
  private env = process.env.NODE_ENV || 'development';
  private version = '0.1.0';

  private buildPayload(
    level: LogLevel,
    event: string,
    message: string,
    errorObj?: Error | null,
    context?: Record<string, unknown>,
    traceId?: string
  ): TelemetryLogPayload {
    const payload: TelemetryLogPayload = {
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      env: this.env,
      version: this.version,
      trace_id: traceId || generateTraceId(),
      session_id: getSessionId(),
      event,
      message,
      client: typeof window !== 'undefined' ? {
        user_agent: navigator.userAgent,
        url: window.location.href,
        screen: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language
      } : undefined,
      context
    };

    if (errorObj) {
      payload.error = {
        type: errorObj.name || 'Error',
        message: errorObj.message,
        stack: errorObj.stack
      };
    }

    return payload;
  }

  public debug(event: string, message: string, context?: Record<string, unknown>): void {
    if (this.env !== 'production') {
      const payload = this.buildPayload('debug', event, message, null, context);
      console.debug(`[DEBUG] [${payload.event}]`, payload);
    }
  }

  public info(event: string, message: string, context?: Record<string, unknown>): void {
    const payload = this.buildPayload('info', event, message, null, context);
    console.info(`[INFO] [${payload.event}]`, payload);
  }

  public warn(event: string, message: string, context?: Record<string, unknown>): void {
    const payload = this.buildPayload('warn', event, message, null, context);
    console.warn(`[WARN] [${payload.event}]`, payload);
  }

  public error(event: string, message: string, error?: Error | unknown, context?: Record<string, unknown>, traceId?: string): void {
    const errorObj = error instanceof Error ? error : (error ? new Error(String(error)) : null);
    const payload = this.buildPayload('error', event, message, errorObj, context, traceId);
    console.error(`[ERROR] [${payload.event}]`, payload);
  }
}

export const logger = new ClientLogger();
