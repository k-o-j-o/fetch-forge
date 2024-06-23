import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

export const handlers = [http.all("*", ({ request }) => resolveRequest(request))];

export const httpServer = setupServer(...handlers);

async function resolveRequest(request: Request) {
	const url = new URL(request.url);

	let body: Record<string, unknown> | undefined;
	if (hasFormDataContentType(request)) {
		const formData = await request.formData();
		body = Object.fromEntries(formData.entries());
	} else if (hasJsonContentType(request)) {
		body = await request.json();
	}

	return HttpResponse.json<MockServerResponse>({
		body,
		url: url.href,
		method: request.method,
		headers: Object.fromEntries(request.headers.entries()),
		params: Object.fromEntries(url.searchParams.entries()),
	});
}

const formDataRegex = /multipart\/form-data;/;
function hasFormDataContentType(request: Request): boolean {
	const contentType = request.headers.get("content-type");
	if (contentType === null) return false;
	return formDataRegex.test(contentType);
}

const jsonRegex = /application\/json/;
function hasJsonContentType(request: Request): boolean {
	const contentType = request.headers.get("content-type");
	if (contentType === null) return false;
	return jsonRegex.test(contentType);
}

// The goal is for the mock server to respond with an echo of everything that was requested
export type MockServerResponse = {
	url: string;
	method: string;
	headers: Record<string, unknown>;
	params: Record<string, unknown>;
	body: Record<string, unknown> | undefined;
};
