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
