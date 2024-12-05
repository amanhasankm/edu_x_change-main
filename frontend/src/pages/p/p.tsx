import { JSX, render } from "preact";

import Nav from "@/components/Nav/Nav";
import PostView from "@/components/PostView/PostView";
import { PostData } from "@/utils/types";
import MarkdownEditor from "@/components/MarkdownEditor/MarkdownEditor";
import classes from "./p.module.css";
import FileInput from "@/components/UI/Input/FileInput";
import { useEffect, useRef, useState } from "preact/hooks";
import Button from "@/components/UI/Button/Button";
import Spinner from "@/components/UI/Spinner/Spinner";
import { debounce, request } from "@/utils/utils";
import usePagination from "@/hooks/usePagination";

declare const __postData: PostData;

const PostPage = () => {
	if (!__postData) return <span>Post not found or internal server error</span>;

	const [notesFiles, setNotesFiles] = useState<File[]>();
	const [messageData, setMessageData] = useState<{
		message: string;
		type: "error" | "success" | "normal";
	} | null>(null);
	const [postReplies, setPostReplies] = useState<PostData[] | null>(null);
	const [pauseScroll, setPauseScroll] = useState(false);
	const editorRef = useRef<any>();

	const page = useRef(1);

	const onNotesInput: JSX.GenericEventHandler<HTMLInputElement> = (e) => {
		if (e.currentTarget.files && e.currentTarget.files.length > 0) {
			const inpFiles = e.currentTarget.files;
			if (inpFiles.length > 5) {
				setMessageData({
					message: "Maximum 5 files allowed",
					type: "error",
				});
				return;
			}

			for (let inpFile of inpFiles) {
				if (!inpFile.name.endsWith(".pdf")) {
					setMessageData({
						message: "Only PDF files are allowed",
						type: "error",
					});
					return;
				}
			}
			setNotesFiles(() => {
				if (inpFiles) {
					const files = [];
					for (let file of inpFiles) files.push(file);
					console.log(files);
					return files;
				}
			});
		}
	};

	const onReplyClick = async () => {
		try {
			const replyBody = editorRef.current?.getMarkdown();

			const formData = new FormData();
			formData.append("body", replyBody);
			if (notesFiles)
				for (const file of notesFiles) formData.append("notes", file);

			const res = await request(
				`/api/posts/reply/${__postData.id}/`,
				formData,
				"POST"
			);
			const data = await res.json();

			if (data.ok) {
				location.reload();
			}

			setMessageData({
				message: data.message,
				type: "error",
			});
		} catch (err) {
			console.error(err);
			alert("Something went wrong while replying");
		}
	};

	const onImageInput = (blob: Blob | File, cb: Function) => {
		const sendImg = async () => {
			const formData = new FormData();
			const file = new File([blob], blob.name.replace(/\s/g, ""), {
				type: blob.type,
			});
			formData.append("image", file);
			formData.append("replyTo", __postData.id.toString());

			const res = await request("/api/posts/image/", formData, "POST");
			const data = await res.json();
			if (data.ok) {
				cb(`${data.data}`, "");
			}

			setMessageData({
				message: data.message,
				type: "error",
			});
		};

		sendImg().catch(() => {
			alert("Something went wrong while uploading image");
		});
	};

	const draftPost = async () => {
		try {
			const formData = new FormData();
			formData.append("body", editorRef.current?.getMarkdown());
			formData.append("replyTo", __postData.id.toString());

			setMessageData({
				message: "Drafting...",
				type: "normal",
			});
			const res = await request(`/api/posts/${"draft"}/`, formData, "POST");
			const data = await res.json();

			console.log(data);

			if (data.ok) {
				setMessageData({
					message: "Drafted",
					type: "success",
				});
				return;
			}

			setMessageData({
				message: data.message,
				type: "error",
			});
		} catch (err) {
			console.log(err);
			setMessageData({
				message: "Something went wrong",
				type: "error",
			});
		}
	};

	const editorDebounce = debounce(() => {
		draftPost();
	}, 2000);

	const getReplies = async () => {
		try {
			setPauseScroll(true);
			const res = await request(
				`/api/posts/reply/${__postData.id}/?page=${page.current}`
			);
			const data = await res.json();

			if (data.ok) {
				if (data.code === "END_OF_PAGE") {
					setPauseScroll(true);
					return;
				}
				setPostReplies((old) => {
					if (old) return [...old, ...data.data];
					return data.data;
				});
				setPauseScroll(false);
				return;
			}

			setPauseScroll(false);
			setMessageData({
				message: data.message,
				type: "error",
			});
		} catch (err) {
			setPauseScroll(false);
			console.error(err);
			alert("Something went wrong while getting replies");
		}
	};

	useEffect(() => {
		const getDraftedPost = async () => {
			try {
				const res = await request(`/api/posts/draft/${__postData.id}/`);
				const data = await res.json();

				if (data.ok) {
					editorRef.current?.setMarkdown(data.data.body);
					return;
				}
			} catch (err) {
				console.error(err);
				alert("Something went wrong while getting drafted post");
			}
		};

		getReplies();
		getDraftedPost();
	}, []);

	usePagination(
		null,
		100,
		() => {
			page.current++;
			getReplies();
		},
		pauseScroll
	);

	return (
		<div className={`main ${classes.container}`}>
			<Nav />
			<div className={`pad container ${classes.postContainer}`}>
				<h2>Post :</h2>
				<PostView postData={__postData} />

				<h3 className={`mt-20 mb-30`}>Post a reply :</h3>

				<div className={`mt-30 ${classes.editorContainer}`}>
					<MarkdownEditor
						className={classes.editor}
						onImageInput={onImageInput}
						onEditorInitialized={(editor) => {
							editorRef.current = editor;
						}}
						onCaretChange={() => editorDebounce()}
						autofocus={false}
					/>
					<div className={`${classes.filesContainer} ml-20`}>
						<p className={`mb-20`}>Attach notes :</p>
						<FileInput
							text='Notes'
							multiple
							width='100px'
							accept='.pdf'
							placeholder={
								<ul style={{ maxWidth: "120px" }} className={`mt-20`}>
									{notesFiles?.map((file, i) => (
										<li
											style={{
												textOverflow: "ellipsis",
												overflow: "hidden",
												whiteSpace: "nowrap",
											}}
											title={file.name}
											key={i}
										>
											{file.name}
										</li>
									))}
								</ul>
							}
							onInput={onNotesInput}
						/>
					</div>
				</div>
				<div className={classes.footer}>
					<span data-type={messageData?.type}>{messageData?.message}</span>
					<Button className={`mt-40`} onClick={onReplyClick}>
						Reply
					</Button>
				</div>

				<h3 className={`mt-20 mb-30`}>Replies :</h3>
				<div>
					{postReplies === null ? (
						<Spinner />
					) : postReplies.length === 0 ? (
						<h3>No replies on this post. Be the first to reply.</h3>
					) : (
						postReplies?.map((reply, i) => (
							<PostView isReply postData={reply} key={i} />
						))
					)}
				</div>
			</div>
		</div>
	);
};

render(<PostPage />, document.getElementById("root") as HTMLElement);
