/// <reference types="vite/client" />

declare module "@toast-ui/editor" {
	import Editor from "@toast-ui/editor/dist/esm/index.js";

	export default Editor;
}

declare module "@toast-ui/editor/dist/toastui-editor-viewer" {
	import Viewer from "@toast-ui/editor/dist/toastui-editor-viewer";

	export default Viewer;
}
