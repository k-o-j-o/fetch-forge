import { afterAll, afterEach, beforeAll, describe, test } from "vitest";
import { httpServer } from "./mocks/http-server";

beforeAll(() => httpServer.listen());

afterEach(() => httpServer.resetHandlers());

afterAll(() => httpServer.close());

describe("url", () => {
	test("can be instance of URL");

	test("can be string");

	test("can be function");

	test("relative url will use location as origin");
});

describe("headers", () => {
	test("can be instance of Headers");

	test("can be object");

	test("can be function");
});

describe("params", () => {
	test("can be instance of URLSearchParams");

	test("can be object");

	test("can be function");
});

describe("body", () => {
	test("can be instance of FormData");

	test("can be object");

	test("can be function");
});

describe("can be iterable source", () => {
	test("containing config objects");

	test("containing iterable source");

	test("absolute url overwrites previous url");

	test("instance of URL overwites previous url");

	test("body configs can be FormData and/or objects");
});
