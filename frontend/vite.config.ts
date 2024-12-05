import fs from "fs";
import { resolve, join } from "path";
import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

const getInputFiles = () => {
	const pagesDir = join(__dirname, "src", "pages");
	const pageFiles = {};

	fs.readdirSync(pagesDir).forEach((folderName) => {
		const folderPath = join(pagesDir, folderName);
		const indexPath = join(folderPath, `${folderName}.tsx`);

		if (fs.existsSync(indexPath)) {
			pageFiles[folderName] = resolve(__dirname, indexPath);
		}
	});
	console.log(pageFiles);
	return pageFiles;
};

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [preact()],
	root: "src",
	base: "/static/vite/",
	server: {
		port: 5173,
	},
	build: {
		manifest: true,
		outDir: "../../dist/vite",
		rollupOptions: {
			input: getInputFiles(),
		},
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "src"),
			"@/components": resolve(__dirname, "src", "components"),
			"@/assets": resolve(__dirname, "src", "assets"),
			"@/utils": resolve(__dirname, "src", "utils"),
			"@/hooks": resolve(__dirname, "src", "hooks"),
		},
	},
});
