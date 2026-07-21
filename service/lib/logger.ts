// 軽量な構造化ロガー。外部依存を持たず console ベースで JSON を出力する。
// Cloudflare Workers / Next.js のサーバーランタイム双方で安全に動くよう、
// Node 専用 API（process.stdout など）には依存しない。

export type LogLevel = "debug" | "info" | "warn" | "error"

// 任意のメタデータ。ログ 1 行に付与する構造化コンテキスト。
export type LogContext = Record<string, unknown>

// 出力される 1 レコードの形。JSON.stringify してそのまま console に流す。
export interface LogEntry {
    level: LogLevel
    message: string
    timestamp: string
    context?: LogContext
}

export interface Logger {
    debug(message: string, context?: LogContext): void
    info(message: string, context?: LogContext): void
    warn(message: string, context?: LogContext): void
    error(message: string, context?: LogContext): void
    // 既定コンテキストを引き継いだ子ロガーを作る。
    child(context: LogContext): Logger
}

export interface LoggerOptions {
    // このレベル未満のログは出力しない。既定は環境変数 LOG_LEVEL、無ければ "debug"。
    level?: LogLevel
    // すべてのログに毎回マージされる既定コンテキスト。
    context?: LogContext
}

// レベルの優先度。数値が大きいほど深刻。
const LEVEL_PRIORITY: Record<LogLevel, number> = {
    debug: 10,
    info: 20,
    warn: 30,
    error: 40,
}

// 既定の最小レベルを決める。process が存在しない実行環境でも壊れないよう guard する。
function defaultLevel(): LogLevel {
    const raw =
        typeof process !== "undefined" && process.env
            ? process.env.LOG_LEVEL
            : undefined
    if (raw && raw in LEVEL_PRIORITY) {
        return raw as LogLevel
    }
    return "debug"
}

// Error は JSON.stringify で {} になってしまうため name/message/stack に展開する。
function serializeError(error: Error): LogContext {
    return {
        name: error.name,
        message: error.message,
        stack: error.stack,
    }
}

// コンテキストの各値を JSON 化しやすい形へ整える（現状は Error のみ特別扱い）。
function normalizeContext(context: LogContext): LogContext {
    const result: LogContext = {}
    for (const [key, value] of Object.entries(context)) {
        result[key] = value instanceof Error ? serializeError(value) : value
    }
    return result
}

// 1 レコードを対応する console メソッドへ書き出す。
// console メソッドを直接呼ぶことで this バインドを保つ。
function write(entry: LogEntry): void {
    let line: string
    try {
        line = JSON.stringify(entry)
    } catch {
        // 循環参照などで JSON 化に失敗した場合は最低限の情報だけ出す。
        line = JSON.stringify({
            level: entry.level,
            message: entry.message,
            timestamp: entry.timestamp,
        })
    }
    switch (entry.level) {
        case "debug":
            console.debug(line)
            break
        case "info":
            console.info(line)
            break
        case "warn":
            console.warn(line)
            break
        case "error":
            console.error(line)
            break
    }
}

export function createLogger(options: LoggerOptions = {}): Logger {
    const threshold = LEVEL_PRIORITY[options.level ?? defaultLevel()]
    const baseContext = options.context

    function log(level: LogLevel, message: string, context?: LogContext): void {
        if (LEVEL_PRIORITY[level] < threshold) {
            return
        }
        const merged = { ...baseContext, ...context }
        const entry: LogEntry = {
            level,
            message,
            timestamp: new Date().toISOString(),
        }
        if (Object.keys(merged).length > 0) {
            entry.context = normalizeContext(merged)
        }
        write(entry)
    }

    return {
        debug: (message, context) => log("debug", message, context),
        info: (message, context) => log("info", message, context),
        warn: (message, context) => log("warn", message, context),
        error: (message, context) => log("error", message, context),
        child: (context) =>
            createLogger({
                level: options.level,
                context: { ...baseContext, ...context },
            }),
    }
}

// アプリ全体で使う既定ロガー。
export const logger = createLogger()
