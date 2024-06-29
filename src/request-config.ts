import { applyConfigs } from "@/configuration";
import { request } from "@/request";
import { HttpConfig, HttpConfigOrSource, HttpConfigSource } from "@/types";

export class RequestConfig<Args = void> implements Iterable<HttpConfigOrSource<Args>> {
	#configs: Set<HttpConfigOrSource<Args>>;

	[Symbol.iterator]!: () => Iterator<HttpConfigOrSource<Args>>;

	private constructor(source: HttpConfigSource<Args>) {
		this.#configs = new Set(source);
		this[Symbol.iterator] = this.#configs[Symbol.iterator].bind(this.#configs);
	}

	public addConfig(...configs: HttpConfig<Args>[]): RequestConfig<Args> {
		configs.forEach((config) => this.#configs.add(config));
		return this;
	}

	public request(args: Args): Promise<Response> {
		const context = applyConfigs(this.#configs, args);
		return request(context);
	}

	public static using<Args = void>(...source: HttpConfigOrSource<Args>[]): RequestConfig<Args> {
		return new RequestConfig(source);
	}
}
