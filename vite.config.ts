/// <reference types="vitest" />
import { defineConfig } from "vite";
import tsconfigpaths from "vite-tsconfig-paths";

export default defineConfig((options) => {
	const shouldMinify = process.env.MINIFY === "true";
	return {
		plugins: [tsconfigpaths()],
		build: {
			target: "es2022",
			emptyOutDir: false,
			minify: shouldMinify ? "esbuild" : false,
			lib: {
				entry: "src/index.ts",
				formats: ["es", "umd"],
				name: "FetchForge",
				fileName: (format) =>
					`fetch-forge${format === "umd" ? ".umd" : ""}${shouldMinify ? ".min" : ""}.js`,
			},
		},
		test: {
			environment: "jsdom",
		},
	};
});
