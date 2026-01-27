import type { CollectionSource, ResolvedCollectionSource } from '@nuxt/content';
export declare function parseSourceBase(source: CollectionSource): {
    fixed: string;
    dynamic: string;
};
/**
 * On Nuxt Content, Id is built like this: {collection.name}/{source.prefix}/{path}
 * But 'source.prefix' can be different from the fixed part of 'source.include'
 * We need to remove the 'source.prefix' from the path and add the fixed part of the 'source.include' to get the fsPath (used to match the source)
 */
export declare function getCollectionSourceById(id: string, sources: ResolvedCollectionSource[]): ResolvedCollectionSource | undefined;
