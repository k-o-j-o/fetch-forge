/// <reference types="vitest" />
import { defineConfig } from "vite";
import tsconfigpaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [tsconfigpaths()],
	build: {
		target: "es2022",
		minify: "esbuild",
		emptyOutDir: false,
		lib: {
			entry: "src/index.ts",
			formats: ["es", "umd"],
			name: "FetchForge",
		},
	},
	test: {
		environment: "jsdom",
	},
});
