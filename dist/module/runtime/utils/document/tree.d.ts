import type { CollectionInfo, MarkdownRoot } from '@nuxt/content';
import type { DatabaseItem } from 'nuxt-studio/app';
export declare function sanitizeDocumentTree(document: DatabaseItem, collection: CollectionInfo): DatabaseItem;
export declare function removeLastStylesFromTree(body: MarkdownRoot): MarkdownRoot;
