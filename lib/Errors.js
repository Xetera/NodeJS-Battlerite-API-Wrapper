module.exports = class AuthorizationError extends Error {
    constructor() {
        super(); // (A)
        this.name = 'Authorization Error';
        this.status = 401;
        this.message = "Invalid token.";
        Error.captureStackTrace(this, AuthorizationError); // added
    }
};
