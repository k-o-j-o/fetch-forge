import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vitest";
import { MockServerResponse, httpServer } from "./mocks/http-server";
import { RequestBuilder } from "@/request-builder";

beforeAll(() => httpServer.listen());

afterEach(() => {
	httpServer.resetHandlers();
	vi.restoreAllMocks();
});

afterAll(() => httpServer.close());

const LOCAL_HOST = "http://localhost";

describe("url", () => {
	test("can be instance of URL", async () => {
		const url = new URL(LOCAL_HOST);
		const test = RequestBuilder.using({ url });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.url).toMatch(LOCAL_HOST);
	});

	test("can be string", async () => {
		const url = LOCAL_HOST;
		const test = RequestBuilder.using({ url });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.url).toMatch(LOCAL_HOST);
	});

	describe("can be function", () => {
		test("returning instance of URL", async () => {
			const url = () => new URL(LOCAL_HOST);
			const test = RequestBuilder.using({ url });
			const response: MockServerResponse = await test.request().then((x) => x.json());
			expect(response.url).toMatch(LOCAL_HOST);
		});

		test("returning string", async () => {
			const url = () => LOCAL_HOST;
			const test = RequestBuilder.using({ url });
			const response: MockServerResponse = await test.request().then((x) => x.json());
			expect(response.url).toMatch(LOCAL_HOST);
		});
	});

	test("can be undefined and defaults to current origin", async () => {
		vi.stubGlobal("location", { origin: LOCAL_HOST });
		const url = undefined;
		const test = RequestBuilder.using({ url });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.url).toMatch(LOCAL_HOST);
	});

	test("relative path will use current origin as origin", async () => {
		const url = "path";
		const test = RequestBuilder.using({ url });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.url).toMatch(LOCAL_HOST + "/" + url);
	});

	test("absolute path will use current origin as origin", async () => {
		vi.stubGlobal("location", { origin: LOCAL_HOST });
		const url = "/path";
		const test = RequestBuilder.using({ url });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.url).toMatch(LOCAL_HOST + url);
	});
});

describe("method", () => {
	test("can be undefined and defaults to 'get'", async () => {
		const method = undefined;
		const test = RequestBuilder.using({ method });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.method).toMatch(/get/i);
	});
});

describe("headers", () => {
	test("can be instance of Headers", async () => {
		const headers = new Headers({
			"test-header": "test header value",
		});
		const test = RequestBuilder.using({ headers });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.headers).toMatchObject(Object.fromEntries(headers.entries()));
	});

	test("can be object", async () => {
		const headers = {
			"test-header": "test header value",
		};
		const test = RequestBuilder.using({ headers });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.headers).toMatchObject(headers);
	});

	describe("can be function", () => {
		test("returning instance of Headers", async () => {
			const headers = () =>
				new Headers({
					"test-header": "test header value",
				});
			const test = RequestBuilder.using({ headers });
			const response: MockServerResponse = await test.request().then((x) => x.json());
			expect(response.headers).toMatchObject(Object.fromEntries(headers().entries()));
		});

		test("returning object", async () => {
			const headers = () => ({
				"test-header": "test header value",
			});
			const test = RequestBuilder.using({ headers });
			const response: MockServerResponse = await test.request().then((x) => x.json());
			expect(response.headers).toMatchObject(headers());
		});
	});

	test("can be undefined", async () => {
		const headers = undefined;
		const test = RequestBuilder.using({ headers });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.headers).toMatchObject({});
	});
});

describe("params", () => {
	test("can be instance of URLSearchParams", async () => {
		const params = new URLSearchParams({ testParam: "test param value" });
		const test = RequestBuilder.using({ params });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.params).toMatchObject(Object.fromEntries(params.entries()));
	});

	test("can be object", async () => {
		const params = { testParam: "test param value" };
		const test = RequestBuilder.using({ params });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.params).toMatchObject(params);
	});

	describe("can be function", () => {
		test("returning instance of URLSearchParams", async () => {
			const params = () => new URLSearchParams({ testParam: "test param value" });
			const test = RequestBuilder.using({ params });
			const response: MockServerResponse = await test.request().then((x) => x.json());
			expect(response.params).toMatchObject(Object.fromEntries(params().entries()));
		});

		test("returning object", async () => {
			const params = () => ({ testParam: "test param value" });
			const test = RequestBuilder.using({ params });
			const response: MockServerResponse = await test.request().then((x) => x.json());
			expect(response.params).toMatchObject(params());
		});
	});

	test("can be undefined", async () => {
		const params = undefined;
		const test = RequestBuilder.using({ params });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.params).toMatchObject({});
	});
});

describe("body", () => {
	test("can be instance of FormData", async () => {
		const method = "post"; // method cannot be GET or HEAD because body will not be sent
		const body = new FormData();
		body.append("testField", "test field value");
		const test = RequestBuilder.using({ body, method });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.body).toMatchObject(Object.fromEntries(body.entries()));
	});

	test("can be object", async () => {
		const method = "post"; // method cannot be GET or HEAD because body will not be sent
		const body = { testField: "test field value" };
		const test = RequestBuilder.using({ body, method });
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
			const test = RequestBuilder.using({ body, method });
			const response: MockServerResponse = await test.request().then((x) => x.json());
			expect(response.body).toMatchObject(Object.fromEntries(body().entries()));
		});

		test("returning object", async () => {
			const method = "post"; // method cannot be GET or HEAD because body will not be sent
			const body = () => ({ testField: "test field value" });
			const test = RequestBuilder.using({ body, method });
			const response: MockServerResponse = await test.request().then((x) => x.json());
			expect(response.body).toMatchObject(body());
		});
	});

	test("can be undefined", async () => {
		const method = "post"; // method cannot be GET or HEAD because body will not be sent
		const body = undefined;
		const test = RequestBuilder.using({ body, method });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.body).toBeUndefined();
	});

	test("not sent with request when 'method' is GET", async () => {
		const method = "get";
		const body = { testField: "test field value" };
		const test = RequestBuilder.using({ body, method });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.body).toBeUndefined();
	});

	test("not sent with request when 'method' is HEAD", async () => {
		const method = "head";
		const body = { testField: "test field value" };
		const test = RequestBuilder.using({ body, method });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.body).toBeUndefined();
	});

	test("content-type header is set to 'application/json' when body is object", async () => {
		const method = "post"; // method cannot be GET or HEAD because body will not be sent
		const body = { testField: "test field value" };
		const test = RequestBuilder.using({ body, method });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.headers["content-type"]).toBe("application/json");
	});

	test("content-type header is set to 'multipart/form-data' when body is instance of FormData", async () => {
		const method = "post"; // method cannot be GET or HEAD because body will not be sent
		const body = new FormData();
		body.append("testField", "test field value");
		const test = RequestBuilder.using({ body, method });
		const response: MockServerResponse = await test.request().then((x) => x.json());
		expect(response.headers["content-type"]).toMatch("multipart/form-data");
	});
});

describe("supports multiple configs", () => {
	describe("using multiple config objects", () => {
		test("all configs are applied", async () => {
			const url = "path";
			const method = "post";
			const headers = { "test-header": "test header value" };
			const params = { testParam: "test param value" };
			const body = { testField: "test field value" };

			const test = RequestBuilder.using(
				{ url },
				{ method },
				{ headers },
				{ params },
				{ body }
			);

			const response: MockServerResponse = await test.request().then((x) => x.json());

			expect(response.url).toMatch(LOCAL_HOST + "/" + url);
			expect(response.method).toMatch(/post/i);
			expect(response.headers).toMatchObject(headers);
			expect(response.params).toMatchObject(params);
			expect(response.body).toMatchObject(body);
		});

		describe("configs are applied in order", () => {
			describe("url", () => {
				test("relative path resolves using previous url", async () => {
					const url1 = "path1";
					const url2 = "path2";
					const test = RequestBuilder.using({ url: url1 }, { url: url2 });
					const response: MockServerResponse = await test.request().then((x) => x.json());
					expect(response.url).toMatch(`${LOCAL_HOST}/${url1}/${url2}`);
				});

				test("absolute path overwrites previous url", async () => {
					const url1 = "path1";
					const url2 = "/path2";
					const test = RequestBuilder.using({ url: url1 }, { url: url2 });
					const response: MockServerResponse = await test.request().then((x) => x.json());
					expect(response.url).toBe(`${LOCAL_HOST}${url2}`);
				});

				test("instance of URL overwrites previous url", async () => {
					const url1 = "path1";
					const url2 = new URL(`${LOCAL_HOST}path2`);
					const test = RequestBuilder.using({ url: url1 }, { url: url2 });
					const response: MockServerResponse = await test.request().then((x) => x.json());
					expect(response.url).toBe(url2.href);
				});

				test("search params on instance of URL are applied", async () => {
					const url = new URL(LOCAL_HOST);
					url.searchParams.append("testParam", "test param value");
					const test = RequestBuilder.using({ url });
					const response: MockServerResponse = await test.request().then((x) => x.json());
					expect(response.params).toMatchObject(
						Object.fromEntries(url.searchParams.entries())
					);
				});
			});

			describe("method", () => {
				test("overwrites previous method", async () => {
					const method1 = "get";
					const method2 = "post";
					const test = RequestBuilder.using({ method: method1 }, { method: method2 });
					const response: MockServerResponse = await test.request().then((x) => x.json());
					expect(response.method).toMatch(/post/i);
				});
			});

			describe("headers", () => {
				test("merges with previous headers", async () => {
					const headers1 = { "test-header-1": "test header value 1" };
					const headers2 = { "test-header-2": "test header value 2" };
					const test = RequestBuilder.using({ headers: headers1 }, { headers: headers2 });
					const response: MockServerResponse = await test.request().then((x) => x.json());
					expect(response.headers).toMatchObject({ ...headers1, ...headers2 });
				});

				test("allows Headers and object to be combined", async () => {
					const headers1 = new Headers({ "test-header-1": "test header value 1" });
					const headers2 = { "test-header-2": "test header value 2" };
					const test = RequestBuilder.using({ headers: headers1 }, { headers: headers2 });
					const response: MockServerResponse = await test.request().then((x) => x.json());
					expect(response.headers).toMatchObject({
						...Object.fromEntries(headers1.entries()),
						...headers2,
					});
				});
			});

			describe("params", () => {
				test("merges with previous params", async () => {
					const params1 = { testParam1: "test param value 1" };
					const params2 = { testParam2: "test param value 2" };
					const test = RequestBuilder.using({ params: params1 }, { params: params2 });
					const response: MockServerResponse = await test.request().then((x) => x.json());
					expect(response.params).toMatchObject({ ...params1, ...params2 });
				});

				test("allows URLSearchParams and object to be combined", async () => {
					const params1 = new URLSearchParams({ testParam1: "test param value 1" });
					const params2 = { testParam2: "test param value 2" };
					const test = RequestBuilder.using({ params: params1 }, { params: params2 });
					const response: MockServerResponse = await test.request().then((x) => x.json());
					expect(response.params).toMatchObject({
						...Object.fromEntries(params1.entries()),
						...params2,
					});
				});
			});

			describe("body", () => {
				test("merges with previous body", async () => {
					const method = "post";
					const body1 = { testField1: "test field value 1" };
					const body2 = { testField2: "test field value 2" };
					const test = RequestBuilder.using({ body: body1, method }, { body: body2 });
					const response: MockServerResponse = await test.request().then((x) => x.json());
					expect(response.body).toMatchObject({ ...body1, ...body2 });
				});

				test("allows FormData and object to be combined", async () => {
					const method = "post";
					const body1 = new FormData();
					body1.append("testField1", "test field value 1");
					const body2 = { testField2: "test field value 2" };
					const test = RequestBuilder.using({ body: body1, method }, { body: body2 });
					const response: MockServerResponse = await test.request().then((x) => x.json());
					expect(response.body).toMatchObject({
						...Object.fromEntries(body1.entries()),
						...body2,
					});
				});
			});
		});
	});

	describe("using a config source", () => {
		test("of other RequestBuilder", async () => {
			const test1 = RequestBuilder.using({ url: "path1" });
			const test2 = RequestBuilder.using(test1, { url: "path2" });
			const response: MockServerResponse = await test2.request().then((x) => x.json());
			expect(response.url).toMatch(LOCAL_HOST + "/path1/path2");
		});

		test("uses updates to source", async () => {
			const test1 = RequestBuilder.using({ url: "path1" });
			const test2 = RequestBuilder.using(test1, { url: "path2" });
			test1.addConfig({ url: "/updated-path1" });
			const response: MockServerResponse = await test2.request().then((x) => x.json());
			expect(response.url).toMatch(LOCAL_HOST + "/updated-path1/path2");
		});
	});
});
