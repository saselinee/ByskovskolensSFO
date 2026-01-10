const isDev = process.env.NODE_ENV !== "production";

function logError(message, error) {
    if (isDev) {
        console.error("ERROR:", message);
        if (error) {
            console.error(error.stack || error);
        }
    }
}

function logInfo(message) {
    if (isDev) {
        console.log("ℹ️ INFO:", message);
    }
}

module.exports = {
    logError,
    logInfo,
};
