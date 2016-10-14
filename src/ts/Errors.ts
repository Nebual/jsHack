class ExtendableError extends Error {
    constructor(message) {
        super(message);
        this.name = (this.constructor as any).name;
        this.message = message;
        if (typeof (Error as any).captureStackTrace === 'function') {
            (Error as any).captureStackTrace(this, this.constructor);
        } else {
            (this as any).stack = (new Error(message) as any).stack;
        }
    }
}
class IOError extends ExtendableError {

}
