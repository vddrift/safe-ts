/**
 * A generic type that cannot be `undefined`.
 */
type Defined<T> = Exclude<T, undefined>;


/**
 * Get nested object. Receive 'undefined' instead of thrown error.
 * @param {(_?) => T} Try. Example ()=>a.b.c or _=>a.b.c
 * @returns {T | undefined}
 */
export function safe<T>(Try: (_?:any) => T): T | undefined;

/**
 * Get nested object. Receive default value instead of thrown error.
 * @param {(_?) => T} Try. Example ()=>a.b.c or _=>a.b.c
 * @param {T} Default. Can't be undefined. Must match plan a.
 * @returns {T} Never returns undefined.
 */
export function safe<T>(Try: (_?:any) => Defined<T|Partial<T>>, Default: Defined<T|Partial<T>>) : T;

export function safe(Try: Function, Default?: any) {
    try {
        const result = Try.call(null);
        return result === undefined ? Default : result;
    } catch (e) {
        return Default;
    }
}

// Found here: https://github.com/Microsoft/TypeScript/issues/23193
type DeepRequired<T> =
    T extends any[] ? DeepRequiredArray<T[number]> :
        T extends {} ? {
            [K in keyof T]-?: DeepRequired<T[K]>;
        } : T;

interface DeepRequiredArray<T> extends Array<DeepRequired<T>> { }

export const all = <T>(obj:T) => <DeepRequired<T>> obj;
