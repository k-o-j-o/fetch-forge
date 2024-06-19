export function isFunction(thing: any): thing is Function {
	return typeof thing === "function";
}

export function isIterable(thing: any): thing is Iterable<any> {
	return thing && thing[Symbol.iterator];
}

export function isObject(thing: any): thing is object {
	return thing && typeof thing === "object";
}

export function returnThis<T>(this: T): T {
	return this;
}

export function appendEntries(
	appendable: Appendable,
	entries: Iterable<KeyValuePair<string, unknown>>
) {
	for (const [key, value] of entries) {
		appendable.append(key, value);
	}
}

export function convertToFormData(obj: object) {
	const formData = new FormData();
	appendEntries(formData, Object.entries(obj));
	return formData;
}
