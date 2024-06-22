import { appendEntries, convertToFormData, isFunction, isIterable, returnThis } from "@/util";
import {
	HttpConfig,
	HttpConfigNormalized,
	HttpConfigOrSource,
	HttpConfigSource,
	HttpContext,
} from "@/http/http";
import * as Symbols from "@/symbols";

export function request<Args>(
	configOrSource: HttpConfigOrSource<Args>,
	args?: Args
): Promise<Response> {
	const context = createContextWithDefaults();

	if (isIterable(configOrSource)) {
		applyConfigSource(configOrSource, args, context);
	} else {
		applyConfig(configOrSource, args, context);
	}

	/* A reminder: the context's query params should be added to the URL instance itself by now */
	const request = new Request(context.url, {
		method: context.method,
		headers: context.headers,
		body: getRequestBodyIfValid(context),
	});

	return fetch(request);
}

function createContextWithDefaults(): HttpContext {
	const url = new URL(location.origin);
	return {
		url,
		method: "get",
		headers: new Headers(),
		/*	this is a bit of a hack, but because the Request constructor does not allow specifying 
			params on their own, they must be added to the URL instance itself.
			When applying configs, the context's params reference will need to be handled carefully */
		params: url.searchParams,
		body: {},
	};
}

function applyConfigSource(
	configs: HttpConfigSource<any>,
	args: any,
	target: HttpContext
): HttpContext {
	for (const configOrSource of configs) {
		if (isIterable(configOrSource)) {
			applyConfigSource(configOrSource, args, target);
		} else {
			applyConfig(configOrSource, args, target);
		}
	}
	return target;
}

function applyConfig(it: HttpConfig<any>, args: any, context: HttpContext) {
	const config = normalizeConfig(it);

	context.method = config.method ?? context.method;
	applyUrlConfig(config, args, context);
	applyHeadersConfig(config, args, context);
	applyParamsConfig(config, args, context);
	applyBodyConfig(config, args, context);
}

function normalizeConfig<Args>(config: HttpConfig<Args>): HttpConfigNormalized<Args> {
	return (
		config[Symbols.NormalizedConfig] ||
		(config[Symbols.NormalizedConfig] = {
			method: config.method,
			url: isFunction(config.url) ? config.url : returnThis.bind(config.url),
			headers: isFunction(config.headers) ? config.headers : returnThis.bind(config.headers),
			params: isFunction(config.params) ? config.params : returnThis.bind(config.params),
			body: isFunction(config.body) ? config.body : returnThis.bind(config.body),
		})
	);
}

function applyUrlConfig(config: HttpConfigNormalized<any>, args: any, target: HttpContext) {
	const url = config.url(args);
	if (isAbsoluteUri(url)) {
		/*	To avoid mutating their data, we "clone" the URL instance the consumer gave us 
			by passing it through the URL constructor */
		target.url = new URL(url);
		/* 	We want to save any params that were passed through a URL instance */
		appendEntries(target.url.searchParams, target.params);
		/* 	and ensure future params are applied to the new URL instance */
		target.params = target.url.searchParams;
	} else if (isAbsolutePathReference(url)) {
		target.url = new URL(location.origin + url);
		appendEntries(target.url.searchParams, target.params);
		target.params = target.url.searchParams;
	} else if (url) {
		target.url.pathname += url;
	}
}

function isAbsoluteUri(url: URL | string): url is URL {
	/* 	RFC 3986 4.3. "Absolute URI" https://www.rfc-editor.org/rfc/rfc3986
		An absolute URI begins with a sceheme. An instance of URL "must" represent an absolute URI */
	return url instanceof URL || beginsWithScheme.test(url);
}

const beginsWithScheme = /^[a-z0-9]+:\/\//;

function isAbsolutePathReference(url: string): boolean {
	/*	RFC 3986  4.2. "Relative Reference" https://www.rfc-editor.org/rfc/rfc3986
		"A relative reference that begins with a single slash character is termed an absolute-path reference" */
	return beginsWithSlash.test(url);
}

const beginsWithSlash = /^[\\\/]/;

function applyHeadersConfig(config: HttpConfigNormalized<any>, args: any, target: HttpContext) {
	const headers = config.headers(args);
	if (headers instanceof Headers) {
		appendEntries(target.headers, headers);
	} else if (headers) {
		appendEntries(target.headers, Object.entries(headers));
	}
}

function applyParamsConfig(config: HttpConfigNormalized<any>, args: any, target: HttpContext) {
	const params = config.params(args);
	if (params instanceof URLSearchParams) {
		appendEntries(target.params, params);
	} else if (params) {
		appendEntries(target.params, Object.entries(params));
	}
}

function applyBodyConfig(config: HttpConfigNormalized<any>, args: any, target: HttpContext) {
	let body = config.body(args);
	if (body instanceof FormData) {
		if (!(target.body instanceof FormData)) {
			target.body = convertToFormData(target.body);
		}
		appendEntries(target.body, body);
	} else if (body) {
		if (target.body instanceof FormData) {
			body = convertToFormData(body);
			appendEntries(target.body, body);
		}
		Object.assign(target.body, body);
	}
}

function getRequestBodyIfValid(context: HttpContext): FormData | string | undefined {
	const method = context.method.toUpperCase();
	if (method === "GET" || method === "HEAD") return undefined;

	if (context.body instanceof FormData) return context.body;

	return JSON.stringify(context.body);
}
