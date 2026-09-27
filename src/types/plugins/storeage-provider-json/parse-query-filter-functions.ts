/** Document-like object passed to query filter functions. */
export type QueryFilterItem = Record<string, unknown>;

export type QueryFilterFunction = (item: QueryFilterItem) => boolean;
