import { render, JSX } from "preact";
import { useEffect, useState, useRef } from "preact/hooks";

import classes from "./post.module.css";
import Nav from "@/components/Nav/Nav";
import MarkdownEditor from "@/components/MarkdownEditor/MarkdownEditor";
import Select from "@/components/UI/Select/Select";
import Input from "@/components/UI/Input/Input";
import Button from "@/components/UI/Button/Button";
import { debounce, request } from "@/utils/utils";
import FileInput from "@/components/UI/Input/FileInput";

type SelectInput = JSX.GenericEventHandler<
	HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
>;
type MessageData = { message: string; type: "error" | "success" | "normal" };

const Post = () => {
	const [title, setTitle] = useState("");
	const [communitySelected, setCommunitySelected] = useState<string>();
	const [communities, setCommunities] = useState([]);
	const [messageData, setMessageData] = useState<MessageData>();
	const [notesFiles, setNotesFiles] = useState<File[]>();

	const editor = useRef<any>();

	const draftPost = async (formData: FormData, isSubmit = false) => {
		try {
			setMessageData({
				message: isSubmit ? "Saving..." : "Drafting...",
				type: "normal",
			});
			const res = await request(
				`/api/posts/${isSubmit ? "save" : "draft"}/`,
				formData,
				"POST"
			);
			const data = await res.json();

			console.log(data);

			if (data.ok) {
				setMessageData({
					message: isSubmit ? "Saved" : "Drafted",
					type: "success",
				});

				if (isSubmit) {
					setTitle("");
					setCommunitySelected("");
					editor.current.setMarkdown("");

					window.location.pathname = "/";
				}
				return;
			}

			setMessageData({
				message: "Couldn't save, check if the post is valid",
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

	const titleDebounceRef = useRef(
		debounce(async (formData: FormData) => {
			draftPost(formData);
		}, 2000)
	);

	const markdownDebounceRef = useRef(
		debounce((md) => {
			console.log(md === "");
			const formData = new FormData();

			if (md !== undefined && md !== null) {
				formData.append("body", md);
				draftPost(formData);
			}
		}, 2000)
	);

	useEffect(() => {
		const getCommunities = async () => {
			const res = await request("/api/community/mycommunities/");
			const data = await res.json();
			console.log(data);

			if (data?.error) {
				return;
			}

			if (data?.data?.length === 0) {
				console.log("no communities");
				return;
			}

			setCommunities(
				data.data.map((com: any) => ({ name: com.name, value: com.name }))
			);
		};

		const getDraftedPost = async () => {
			const res = await request("/api/posts/draft/");
			const data = await res.json();

			console.log(data);

			if (data.ok) {
				if (data.data.title) setTitle(data.data.title);
				if (data.data.communityName)
					setCommunitySelected(data.data.communityName);
				if (data.data.body) editor.current?.setMarkdown(data.data.body);
			}
		};

		getCommunities();
		getDraftedPost();
	}, []);

	const onCommInput: SelectInput = (e) => {
		setCommunitySelected(() => {
			const newTitle = e.currentTarget.value;
			const formData = new FormData();
			formData.append("community", newTitle);
			titleDebounceRef.current(formData);
			return newTitle;
		});
	};

	const onTitleInput: SelectInput = (e) => {
		setTitle(() => {
			const newTitle = e.currentTarget.value;
			const formData = new FormData();
			formData.append("title", newTitle);
			titleDebounceRef.current(formData);
			return newTitle;
		});
	};

	const onMarkdownInput = () => {
		console.log("something happened");
		markdownDebounceRef.current(editor.current?.getMarkdown());
	};

	const onImageInput = (blob: Blob | File, cb: Function) => {
		const sendImg = async () => {
			const formData = new FormData();
			const file = new File([blob], blob.name.replace(/\s/g, ""), {
				type: blob.type,
			});
			formData.append("image", file);

			const res = await request("/api/posts/image/", formData, "POST");
			const data = await res.json();
			if (data.ok) {
				cb(`${data.data}`, "");
			}

			if (data.error) {
				setMessageData({
					message: data.message,
					type: "error",
				});
			}
		};

		sendImg().catch(() => {
			alert("Something went wrong while uploading image");
		});
	};

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

	const onSubmit = async () => {
		const formData = new FormData();
		console.log(title, communitySelected, editor);
		console.log(notesFiles);
		if (
			title.length < 3 ||
			title.length > 100 ||
			communitySelected === undefined
		) {
			setMessageData({
				message: "Title and community are required and must be valid",
				type: "error",
			});
			return;
		}

		formData.append("title", title);
		formData.append("body", editor.current?.getMarkdown());
		formData.append("community", communitySelected);
		if (notesFiles)
			for (const file of notesFiles) formData.append("notes", file);

		draftPost(formData, true);
	};

	return (
		<div className={`${classes.container} main`}>
			<Nav />
			<main className={`container pad`}>
				<h2 className={`mb-20`}>Create Post :</h2>
				<div className={classes.inpContainer}>
					<span className={`mr-30`}>Choose community :</span>
					<Select
						options={communities}
						value={communitySelected}
						onInput={onCommInput}
					/>

					<span>Choose title :</span>
					<Input
						value={title}
						maxLength={100}
						placeholder='Enter title for your post'
						onInput={onTitleInput}
					/>
				</div>

				<div className={`mt-30`}>
					<span>Post contents :</span>
					<div className={classes.markdownContainer}>
						<MarkdownEditor
							className={`mt-20 ${classes.markdown}`}
							onEditorInitialized={(ed) => {
								editor.current = ed;
							}}
							onInput={onMarkdownInput}
							onImageInput={onImageInput}
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
				</div>
				<div className={`mt-30 ${classes.btnContainer}`}>
					<span data-type={messageData?.type} className={classes.message}>
						{messageData?.message}
					</span>
					<Button onClick={onSubmit}>Submit</Button>
				</div>
				<span>Note: PDF files won't be drafted!</span>
			</main>
		</div>
	);
};

render(<Post />, document.getElementById("root") as HTMLElement);
