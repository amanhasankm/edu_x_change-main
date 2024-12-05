import { useRef, useEffect } from "preact/hooks";

import Editor from "@toast-ui/editor";
import codeSyntaxHighlight from "@toast-ui/editor-plugin-code-syntax-highlight";
import Prism from "prismjs";
import "prismjs/themes/prism.min.css";
import "@toast-ui/editor/toastui-editor.css";

import classes from "./MarkdownEditor.module.css";

type Props = {
	className?: string;
	initialValue?: string;
	onEditorInitialized?: (editor: any) => void;
	onInput?: (editorType: "wysiwyg" | "markdown") => void;
	onImageInput?: (blob: Blob | File, callback: Function) => void;
	onCaretChange?: (editorType: "wysiwyg" | "markdown") => void;
	autofocus?: boolean;
};

const MarkdownEditor = (props: Props) => {
	const editorRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const editor = new Editor({
			el: editorRef.current!,
			height: "100%",
			initialEditType: "wysiwyg",
			placeholder: "Type your post...",
			initialValue: props.initialValue || ``,
			plugins: [[codeSyntaxHighlight, { highlighter: Prism }]],
			events: {
				change: (e: any) => {
					if (props.onInput) props.onInput(e);
				},
				caretChange: (e: any) => {
					if (props.onCaretChange) props.onCaretChange(e);
				},
			},
			autofocus: props.autofocus,
		});

		if (props.onImageInput) {
			editor.addHook("addImageBlobHook", (blob: Blob | File, callback: any) => {
				if (props.onImageInput) props.onImageInput(blob, callback);
				// console.log(blob);
				// callback("https://http.cat/408", "Cat");
			});
		}

		if (props.onEditorInitialized) props.onEditorInitialized(editor);

		const markdown = editor.getMarkdown();
		console.log(markdown);
	}, []);

	return (
		<div className={`${classes.container} ${props.className || ""}`}>
			<div ref={editorRef}></div>
		</div>
	);
};

export default MarkdownEditor;
