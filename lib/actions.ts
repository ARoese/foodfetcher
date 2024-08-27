type ServerActionResult<T> = {
    error?: never,
    result: T
}

type ServerActionError = {
    result?: never,
    error: string
}

// Variation on the Either monad
export type ServerActionResponse<T> = ServerActionResult<T> | ServerActionError;

export function intoError(reason: string) : ServerActionError {
    return {error: reason}; 
}

export function intoResult<T>(result: T){
    return {result};
}

export function isError<T>(check : ServerActionResponse<T>) : boolean {
    return check.error !== undefined;
}