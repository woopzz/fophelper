/**
 * There is a need to distinguish errors raised manually from the runtime errors.
 * Thus you have to use this class to throw an error.
 */
class CustomError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export default CustomError;
