import type { DatabaseItem } from 'nuxt-studio/app';
export declare function addPageTypeFields(dbItem: DatabaseItem): {
    title: {};
    stem: string;
    extension: string;
    id: string;
    meta: Record<string, unknown>;
    fsPath?: string;
    path: string;
};
export declare function generateTitleFromPath(path: string): string;
export declare function generateStemFromId(id: string): string;
export declare function generatePathFromStem(stem: string): string;
export declare function parseDocumentId(id: string): {
    source: string | undefined;
    stem: string;
    extension: string;
    basename: string;
};
export declare function getFileExtension(id: string): string | undefined;
