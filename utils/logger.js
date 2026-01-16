const env = process.env.NODE_ENV || "development";
const isProd = env === "production";
const isDevLike = !isProd;

// Fælles timestamp (ISO 8601 – standard i logs)
function timestamp() {
    return new Date().toISOString();
}

// Logger INFO (kun dev/test)
function logInfo(message, meta = {}) {
    if (!isDevLike) return;

    console.log(
        `[${timestamp()}] [INFO] ${message}`,
        Object.keys(meta).length ? meta : ""
    );
}

// Logger ERROR (altid)
function logError(message, error = null, meta = {}) {
    console.error(
        `[${timestamp()}] [ERROR] ${message}`,
        Object.keys(meta).length ? meta : ""
    );

    if (!error) return;

    if (isDevLike) {
        // Dev/test: fuld stacktrace
        console.error(error.stack || error);
    } else {
        // Production: kun fejlbesked
        console.error(
            `[${timestamp()}] [ERROR] cause:`,
            error.message || String(error)
        );
    }
}

module.exports = {
    logInfo,
    logError,
};
