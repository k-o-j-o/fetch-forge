import { NormalizedConfig } from "@/symbols";

/**
 * @public
 */
declare type HttpMethod =
	| AnyCase<"head">
	| AnyCase<"get">
	| AnyCase<"post">
	| AnyCase<"put">
	| AnyCase<"patch">
	| AnyCase<"delete">;

/**
 * @public
 */
declare type HttpConfig<Args> = Partial<{
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
	[NormalizedConfig]: HttpConfigNormalized<Args>;
}>;

/**
 * @private
 */
declare type HttpConfigNormalized<Args> = {
	url: Expression<[Args], string | URL>;
	method?: HttpMethod;
	headers: Expression<[Args], Record<string, unknown> | Headers | undefined>;
	params: Expression<[Args], Record<string, unknown> | URLSearchParams | undefined>;
	body: Expression<[Args], Record<string, unknown> | FormData | undefined>;
};

/**
 * @public
 */
declare type HttpContext = {
	url: URL;
	method: HttpMethod;
	headers: Headers;
	params: URLSearchParams;
	body?: Record<string, unknown> | FormData;
};

/**
 * @public
 */
declare type HttpConfigSource<Args = unknown> = Iterable<HttpConfigOrSource<Args>>;

/**
 * @public
 */
declare type HttpConfigSourceNormalized<Args = unknown> = Array<
	HttpConfigNormalized<Args> | HttpConfigSourceNormalized<Args>
>;

/**
 * @public
 */
declare type HttpConfigOrSource<Args> = HttpConfig<Args> | HttpConfigSource<Args>;
