import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

export const httpServer = setupServer(http.all("/*", ({ request }) => resolveRequest(request)));

async function resolveRequest(request: Request) {
  const url = new URL(request.url);

  return HttpResponse.json<MockServerResponse>({
    url: url.href,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    params: Object.fromEntries(url.searchParams.entries()),
    body: await request.json(),
  });
}

// The goal is for the mock server to respond with an echo of everything that was requested
export type MockServerResponse = {
  url: string;
  method: string;
  headers: Record<string, unknown>;
  params: Record<string, unknown>;
  body: Record<string, unknown>;
};
