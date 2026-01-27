export declare const omit: (obj: Record<string, unknown>, keys: string | string[]) => {
    [k: string]: unknown;
};
export declare const pick: (obj: Record<string, unknown>, keys: string | string[]) => {
    [k: string]: unknown;
};
export declare function doObjectsMatch(base: Record<string, unknown>, target: Record<string, unknown>): boolean;
