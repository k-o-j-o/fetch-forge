import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { MockServerResponse, httpServer } from "./mocks/http-server";

import { RequestBuilder } from "@/http";

beforeAll(() => httpServer.listen());

afterEach(() => {
	httpServer.resetHandlers();
	vi.restoreAllMocks();
});

afterAll(() => httpServer.close());

const LOCAL_HOST = "http://127.0.0.1/";

describe("url", () => {
	test("can be instance of URL", async () => {
		const url = new URL(LOCAL_HOST);
		const test = new RequestBuilder({ url });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.url).toBe(LOCAL_HOST);
	});

	test("can be string", async () => {
		const url = LOCAL_HOST;
		const test = new RequestBuilder({ url });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.url).toBe(LOCAL_HOST);
	});

	describe("can be function", () => {
		test("returning instance of URL", async () => {
			const url = () => new URL(LOCAL_HOST);
			const test = new RequestBuilder({ url });
			const response: MockServerResponse = await test.request().then((x) => x.json());
			expect(response.url).toBe(LOCAL_HOST);
		});

		test("returning string", async () => {
			const url = () => LOCAL_HOST;
			const test = new RequestBuilder({ url });
			const response: MockServerResponse = await test.request().then((x) => x.json());
			expect(response.url).toBe(LOCAL_HOST);
		});
	});

	test("can be undefined and defaults to current origin", async () => {
		vi.stubGlobal("location", { origin: LOCAL_HOST });
		const url = undefined;
		const test = new RequestBuilder({ url });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.url).toBe(LOCAL_HOST);
	});

	test("relative path will use current origin as origin", async () => {
		const url = "path";
		const test = new RequestBuilder({ url });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.url).toBe(LOCAL_HOST + url);
	});

	test("absolute path will use current origin as origin", async () => {
		vi.stubGlobal("location", { origin: LOCAL_HOST });
		const url = "/path";
		const test = new RequestBuilder({ url });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.url).toBe(LOCAL_HOST + url);
	});
});

describe("method", () => {
	test("can be undefined and defaults to 'get'", async () => {
		const method = undefined;
		const test = new RequestBuilder({ method });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.method).toMatch(/get/i);
	});
});

describe("headers", () => {
	test("can be instance of Headers", async () => {
		const headers = new Headers({
			"test-header": "test header value",
		});
		const test = new RequestBuilder({ headers });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.headers).toMatchObject(Object.fromEntries(headers.entries()));
	});

	test("can be object", async () => {
		const headers = {
			"test-header": "test header value",
		};
		const test = new RequestBuilder({ headers });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.headers).toMatchObject(headers);
	});

	describe("can be function", () => {
		test("returning instance of Headers", async () => {
			const headers = () =>
				new Headers({
					"test-header": "test header value",
				});
			const test = new RequestBuilder({ headers });
			const response: MockServerResponse = await test.request().then((x) => x.json());
			expect(response.headers).toMatchObject(Object.fromEntries(headers().entries()));
		});

		test("returning object", async () => {
			const headers = () => ({
				"test-header": "test header value",
			});
			const test = new RequestBuilder({ headers });
			const response: MockServerResponse = await test.request().then((x) => x.json());
			expect(response.headers).toMatchObject(headers());
		});
	});

	test("can be undefined", async () => {
		const headers = undefined;
		const test = new RequestBuilder({ headers });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.headers).toMatchObject({});
	});
});

describe("params", () => {
	test("can be instance of URLSearchParams", async () => {
		const params = new URLSearchParams({ testParam: "test param value" });
		const test = new RequestBuilder({ params });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.params).toMatchObject(Object.fromEntries(params.entries()));
	});

	test("can be object", async () => {
		const params = { testParam: "test param value" };
		const test = new RequestBuilder({ params });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.params).toMatchObject(params);
	});

	describe("can be function", () => {
		test("returning instance of URLSearchParams", async () => {
			const params = () => new URLSearchParams({ testParam: "test param value" });
			const test = new RequestBuilder({ params });
			const response: MockServerResponse = await test.request().then((x) => x.json());
			expect(response.params).toMatchObject(Object.fromEntries(params().entries()));
		});

		test("returning object", async () => {
			const params = () => ({ testParam: "test param value" });
			const test = new RequestBuilder({ params });
			const response: MockServerResponse = await test.request().then((x) => x.json());
			expect(response.params).toMatchObject(params());
		});
	});

	test("can be undefined", async () => {
		const params = undefined;
		const test = new RequestBuilder({ params });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.params).toMatchObject({});
	});
});

describe("body", () => {
	test("can be instance of FormData", async () => {
		const method = "post"; // method cannot be GET or HEAD because body will not be sent
		const body = new FormData();
		body.append("testField", "test field value");
		const test = new RequestBuilder({ body, method });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.body).toMatchObject(Object.fromEntries(body.entries()));
	});

	test("can be object", async () => {
		const method = "post"; // method cannot be GET or HEAD because body will not be sent
		const body = { testField: "test field value" };
		const test = new RequestBuilder({ body, method });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.body).toMatchObject(body);
	});

	describe("can be function", () => {
		test("returning instance of FormData", async () => {
			const method = "post"; // method cannot be GET or HEAD because body will not be sent
			const body = () => {
				const formData = new FormData();
				formData.append("testField", "test field value");
				return formData;
			};
			const test = new RequestBuilder({ body, method });
			const response: MockServerResponse = await test.request().then((x) => x.json());
			expect(response.body).toMatchObject(Object.fromEntries(body().entries()));
		});

		test("returning object", async () => {
			const method = "post"; // method cannot be GET or HEAD because body will not be sent
			const body = () => ({ testField: "test field value" });
			const test = new RequestBuilder({ body, method });
			const response: MockServerResponse = await test.request().then((x) => x.json());
			expect(response.body).toMatchObject(body());
		});
	});

	test("can be undefined", async () => {
		const method = "post"; // method cannot be GET or HEAD because body will not be sent
		const body = undefined;
		const test = new RequestBuilder({ body, method });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.body).toBeUndefined();
	});

	test("not sent with request when 'method' is GET", async () => {
		const method = "get";
		const body = { testField: "test field value" };
		const test = new RequestBuilder({ body, method });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.body).toBeUndefined();
	});

	test("not sent with request when 'method' is HEAD", async () => {
		const method = "head";
		const body = { testField: "test field value" };
		const test = new RequestBuilder({ body, method });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.body).toBeUndefined();
	});

	test("content-type header is set to 'application/json' when body is object", async () => {
		const method = "post"; // method cannot be GET or HEAD because body will not be sent
		const body = { testField: "test field value" };
		const test = new RequestBuilder({ body, method });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.headers["content-type"]).toBe("application/json");
	});
});

describe("can be iterable source", () => {
	test("containing config objects");

	test("containing iterable source");

	test("absolute url overwrites previous url");

	test("instance of URL overwites previous url");

	test("body configs can be FormData and/or objects");
});
