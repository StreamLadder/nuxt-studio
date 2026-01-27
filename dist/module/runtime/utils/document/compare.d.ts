import type { DatabaseItem } from 'nuxt-studio/app';
export declare function isDocumentMatchingContent(content: string, document: DatabaseItem): Promise<boolean>;
export declare function areDocumentsEqual(document1: Record<string, unknown>, document2: Record<string, unknown>): boolean;
