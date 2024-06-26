import { appendEntries } from "@/util";
import { HttpContext } from "./types";

export function request(context: HttpContext): Promise<Response> {
	appendEntries(context.url.searchParams, context.params);

	const body = getRequestBodyIfValid(context);

	if (typeof body === "string" && !context.headers.has("Content-Type")) {
		context.headers.set("Content-Type", "application/json");
	}

	const request = new Request(context.url, {
		method: context.method,
		headers: context.headers,
		body,
	});

	return fetch(request);
}

function getRequestBodyIfValid(context: HttpContext): FormData | string | undefined {
	const method = context.method.toUpperCase();
	if (method === "GET" || method === "HEAD") return undefined;

	if (context.body instanceof FormData) return context.body;

	return JSON.stringify(context.body);
}
