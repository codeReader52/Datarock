export class IllegalInputError extends Error {
    constructor(message: string) {
        super(message);
    }
}

export class InvalidStateError extends Error {
    constructor(message: string) {
        super(message);
    }
}
