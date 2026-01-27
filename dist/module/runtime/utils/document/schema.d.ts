import type { CollectionInfo, CollectionItemBase } from '@nuxt/content';
import type { DatabaseItem } from 'nuxt-studio/app';
export declare const reservedKeys: string[];
export declare function applyCollectionSchema(id: string, collectionInfo: CollectionInfo, document: CollectionItemBase): DatabaseItem;
export declare function pickReservedKeysFromDocument(document: DatabaseItem): DatabaseItem;
export declare function removeReservedKeysFromDocument(document: DatabaseItem): DatabaseItem;
