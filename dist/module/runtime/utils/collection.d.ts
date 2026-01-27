import type { CollectionInfo, Draft07, ResolvedCollectionSource } from '@nuxt/content';
/**
 * Generation methods
 */
export declare function generateStemFromFsPath(path: string): string;
export declare function generateIdFromFsPath(path: string, collectionInfo: CollectionInfo): string;
export declare function generateFsPathFromId(id: string, source: ResolvedCollectionSource): string;
/**
 * Utils methods
 */
export declare function getOrderedSchemaKeys(schema: Draft07): string[];
export declare function getCollectionByFilePath(path: string, collections: Record<string, CollectionInfo>): CollectionInfo | undefined;
export declare function getCollectionById(id: string, collections: Record<string, CollectionInfo>): CollectionInfo;
export declare function generateRecordInsert(collection: CollectionInfo, data: Record<string, unknown>): string;
export declare function generateRecordDeletion(collection: CollectionInfo, id: string): string;
