/** 
 * @public 
 */
declare type HttpMethod = AnyCase<'get'> | AnyCase<'post'> | AnyCase<'put'> | AnyCase<'patch'> | AnyCase<'delete'>;

/**
 * @public
 */
declare type HttpConfig<Args> = Partial<{
    url: string | Expression<Args, string>;
    method: HttpMethod;
    headers: Record<string, unknown> | Headers | Expression<Args, Record<string, unknown> | Headers>;
    query: Record<string, unknown> | URLSearchParams | Expression<Args, Record<string, unknown> | URLSearchParams>;
    body: Record<string, unknown> | FormData | Expression<Args, Record<string, unknown> | FormData>;
}>;

/**
 * @private
 */
declare type HttpConfigNormalized<Args> = {
    url: Expression<[Args], string>;
    method: HttpMethod;
    headers: Expression<[Args], Record<string, unknown>>;
    query: Expression<Args, Record<string, unknown>>;
    body: Expression<[Args], Record<string, unknown> | FormData>;
}

/**
 * @public
 */
declare type HttpContext = {
    url: string;
    method: HttpMethod;
    headers: Headers;
    query: URLSearchParams;
    body: Record<string, unknown> | FormData;
}