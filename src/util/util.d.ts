declare type AnyCase<T extends string> = Lowercase<T> | Uppercase<T>;

declare type Expression<Args, Return> = (...args: Args) => Return;

declare type Constructor<T> = new (...args: unknown[]) => T;

declare type Appendable<Key extends PropertyKey = PropertyKey, Value = unknown> = {
  append(key: Key, value: Value): void;
};

declare type KeyValuePair<Key extends PropertyKey = PropertyKey, Value = unknown> = [Key, Value];
