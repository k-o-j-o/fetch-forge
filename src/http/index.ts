import { appendEntries, convertToFormData, isFunction, isIterable, returnThis } from "@/util";
import {
	HttpConfig,
	HttpConfigNormalized,
	HttpConfigOrSource,
	HttpConfigSource,
	HttpContext,
} from "@/http/http";
import * as Symbols from "@/symbols";

export function request<Args>(configOrSource: HttpConfigOrSource<Args>, args?: Args) {
	const context = createContextWithDefaults();

	if (isIterable(configOrSource)) {
		applyConfigSource(configOrSource, args, context);
	} else {
		applyConfig(configOrSource, args, context);
	}

	const request = new Request(context.url, {
		method: context.method,
		headers: context.headers,
		body: context.body instanceof FormData ? context.body : JSON.stringify(context.body),
	});

	return fetch(request);
}

function createContextWithDefaults(): HttpContext {
	return {
		url: new URL(location.origin),
		method: "get",
		headers: new Headers(),
		params: new URLSearchParams(),
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

const beginsWithSlash = /^[\\\/]/;
const beginsWithProtocol = /^http/;

function applyUrlConfig(config: HttpConfigNormalized<any>, args: any, target: HttpContext) {
	const url = config.url(args);
	if (url instanceof URL) {
		//a URL instance must represent an absolute path, so we should replace the whole thing
		target.url = url;
	} else if (beginsWithSlash.test(url) || beginsWithProtocol.test(url)) {
		target.url = new URL(url);
	} else if (url) {
		target.url.pathname += url;
	}
}

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
