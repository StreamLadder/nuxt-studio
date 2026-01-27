import type { DatabaseItem, MarkdownParsingOptions } from 'nuxt-studio/app';
export declare function generateDocumentFromContent(id: string, content: string, options?: MarkdownParsingOptions): Promise<DatabaseItem | null>;
export declare function generateDocumentFromYAMLContent(id: string, content: string): Promise<DatabaseItem>;
export declare function generateDocumentFromJSONContent(id: string, content: string): Promise<DatabaseItem>;
export declare function generateDocumentFromMarkdownContent(id: string, content: string, options?: MarkdownParsingOptions): Promise<DatabaseItem>;
export declare function generateContentFromDocument(document: DatabaseItem): Promise<string | null>;
export declare function generateContentFromYAMLDocument(document: DatabaseItem): Promise<string | null>;
export declare function generateContentFromJSONDocument(document: DatabaseItem): Promise<string | null>;
export declare function generateContentFromMarkdownDocument(document: DatabaseItem): Promise<string | null>;
