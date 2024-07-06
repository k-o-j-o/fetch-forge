/**
 * @public
 */
export type HttpMethod =
	| AnyCase<"head">
	| AnyCase<"get">
	| AnyCase<"post">
	| AnyCase<"put">
	| AnyCase<"patch">
	| AnyCase<"delete">;

/**
 * @public
 */
export type HttpConfig<Args> = Partial<{
	url: string | URL | Expression<[Args], string | URL>;
	method: HttpMethod;
	headers:
		| Record<string, unknown>
		| Headers
		| Expression<[Args], Record<string, unknown> | Headers>;
	params:
		| Record<string, unknown>
		| URLSearchParams
		| Expression<[Args], Record<string, unknown> | URLSearchParams>;
	body:
		| Record<string, unknown>
		| FormData
		| Expression<[Args], Record<string, unknown> | FormData>;
}>;

/**
 * @private
 */
export type HttpConfigNormalized<Args> = {
	url: Expression<[Args], string | URL>;
	method?: HttpMethod;
	headers: Expression<[Args], Record<string, unknown> | Headers | undefined>;
	params: Expression<[Args], Record<string, unknown> | URLSearchParams | undefined>;
	body: Expression<[Args], Record<string, unknown> | FormData | undefined>;
};

/**
 * @public
 */
export type HttpContext = {
	url: URL;
	method: HttpMethod;
	headers: Headers;
	params: URLSearchParams;
	body?: Record<string, unknown> | FormData;
};

/**
 * @public
 */
export type HttpConfigSource<Args = unknown> = Iterable<HttpConfigOrSource<Args>>;

/**
 * @public
 */
export type HttpConfigSourceNormalized<Args = unknown> = Array<
	HttpConfigNormalized<Args> | HttpConfigSourceNormalized<Args>
>;

/**
 * @public
 */
export type HttpConfigOrSource<Args> = HttpConfig<Args> | HttpConfigSource<Args>;

// #region Utility Types
export type AnyCase<T extends string> = Lowercase<T> | Uppercase<T>;

export type Expression<Args extends Array<unknown>, Return> = (...args: Args) => Return;

export type Constructor<T> = new (...args: unknown[]) => T;

export type Appendable<Key extends PropertyKey = PropertyKey, Value = unknown> = {
	append(key: Key, value: Value): void;
};

export type KeyValuePair<Key extends PropertyKey = PropertyKey, Value = unknown> = [Key, Value];
// #endregion
