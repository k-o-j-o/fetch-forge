import { isFunction, isIterable, returnThis } from "@/util";
import { HttpConfig, HttpConfigNormalized, HttpConfigSource, HttpContext } from "@/http/http";
import * as Symbols from "@/symbols";

export function request<Args>(configs: HttpConfigNormalized<Args>[], args: Args) {
  const context = getDefaultContext();

  applyAllConfigs(configs, args, context);

  const request = new Request(context.url, {
    method: context.method,
    headers: context.headers,
    body: context.body instanceof FormData ? context.body : JSON.stringify(context.body),
  });

  return fetch(request);
}

const CONTEXT_DEFAULTS = {
  url: "",
  method: "get",
  body: {},
} as const;

function getDefaultContext() {
  return Object.assign({ headers: new Headers(), query: new URLSearchParams() }, CONTEXT_DEFAULTS);
}

function applyAllConfigs(
  configs: HttpConfigSource<any>,
  args: any,
  target: HttpContext
): HttpContext {
  for (const configOrSource of configs) {
    if (isIterable(configOrSource)) {
      applyAllConfigs(configOrSource, args, target);
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
  applyQueryConfig(config, args, context);
  applyBodyConfig(config, args, context);
}

function normalizeConfig<Args>(config: HttpConfig<Args>): HttpConfigNormalized<Args> {
  return (
    config[Symbols.NormalizedConfig] ||
    (config[Symbols.NormalizedConfig] = {
      method: config.method,
      url: isFunction(config.url) ? config.url : returnThis.bind(config.url),
      headers: isFunction(config.headers) ? config.headers : returnThis.bind(config.headers),
      query: isFunction(config.query) ? config.query : returnThis.bind(config.query),
      body: isFunction(config.body) ? config.body : returnThis.bind(config.body),
    })
  );
}

const beginsWithSlash = /^[\\\/]/;
const beginsWithProtocol = /^http/;

function applyUrlConfig(config: HttpConfigNormalized<any>, args: any, target: HttpContext) {
  const url = config.url(args);
  if (beginsWithSlash.test(url) || beginsWithProtocol.test(url)) {
    target.url = url;
  } else {
    target.url += url;
  }
}

function applyHeadersConfig(config: HttpConfigNormalized<any>, args: any, target: HttpContext) {
  const headers = config.headers(args);
  if (headers instanceof Headers) {
    appendEntries(target.headers, headers);
  } else {
    appendEntries(target.headers, Object.entries(headers));
  }
}

function applyQueryConfig(config: HttpConfigNormalized<any>, args: any, target: HttpContext) {
  const query = config.query(args);
  if (query instanceof URLSearchParams) {
    appendEntries(target.query, query);
  } else {
    appendEntries(target.query, Object.entries(query));
  }
}

function applyBodyConfig(config: HttpConfigNormalized<any>, args: any, target: HttpContext) {
  const body = config.body(args);
  if (body instanceof FormData) {
    if (!(target.body instanceof FormData)) {
      const formData = new FormData();
      appendEntries(formData, Object.entries(target.body));
      target.body = formData;
    }
    appendEntries(target.body, body);
  } else {
    Object.assign(target.body, body);
  }
}

function appendEntries(appendable: Appendable, entries: Iterable<KeyValuePair<string, unknown>>) {
  for (const [key, value] of entries) {
    appendable.append(key, value);
  }
}
