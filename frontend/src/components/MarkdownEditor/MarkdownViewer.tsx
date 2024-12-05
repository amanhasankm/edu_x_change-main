import { JSX } from "preact";
import { useEffect, useRef } from "preact/hooks";
import Viewer from "@toast-ui/editor/dist/toastui-editor-viewer";
import "@toast-ui/editor/dist/toastui-editor-viewer.css";
import codeSyntaxHighlight from "@toast-ui/editor-plugin-code-syntax-highlight";
import Prism from "prismjs";
import "prismjs/themes/prism.min.css";

import classes from "./MarkdownEditor.module.css";
import Upvote from "@/assets/icons/Upvote";
import { PostData } from "@/utils/types";

type Props = {
	postData: PostData;
	className?: string;
	onUpvoteClick?: JSX.MouseEventHandler<HTMLDivElement>;
	onDownvoteClick?: JSX.MouseEventHandler<HTMLDivElement>;
	isReply?: boolean;
};

const MarkdownViewer = ({ postData, ...props }: Props) => {
	const viewerElRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		new Viewer({
			el: viewerElRef.current!,
			height: "100%",
			initialValue: postData.body,
			plugins: [[codeSyntaxHighlight, { highlighter: Prism }]],
		});
	}, []);

	return (
		<div
			className={`${classes.viewerContainer} ${props.className || undefined}`}
		>
			<div className={classes.viewerWrapper}>
				<div className={`mr-20`}>
					<div className={classes.btn} onClick={props.onUpvoteClick}>
						<Upvote width='36' fill={postData.upvoted} />
					</div>
					<p className={`mt-5 mb-5 ${classes.count}`}>
						{postData.upvoteCount - postData.downvoteCount}
					</p>
					<div className={classes.btn} onClick={props.onDownvoteClick}>
						<Upvote down width='36' fill={postData.downvoted} />
					</div>
				</div>
				<div style={{ width: "100%" }}>
					{!props.isReply ? (
						<a href={`/p/${postData.id}/`} style={{ color: "var(--black)" }}>
							<h1 className={`mb-30`}>{postData.title}</h1>
						</a>
					) : null}
					<div ref={viewerElRef}></div>
					{postData.notes.length > 0 ? (
						<div>
							<hr />
							<p className='mb-10 mt-5'>Notes :</p>
							<div className={classes.notesBtnWrapper}>
								{postData.notes.map((note, i) => (
									<a
										href={note.link}
										className='mr-10 lite-shadow'
										key={i}
										style={{ textAlign: "center" }}
										title={note.name}
									>
										{note.name}
									</a>
								))}
							</div>
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
};

export default MarkdownViewer;
