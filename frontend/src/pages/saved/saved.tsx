import { useEffect, useRef, useState } from "preact/hooks";
import { render } from "preact";
import Nav from "@/components/Nav/Nav";
import { PostData, UserData } from "@/utils/types";

import classes from "./saved.module.css";
import PostView from "@/components/PostView/PostView";
import { request } from "@/utils/utils";
import Spinner from "@/components/UI/Spinner/Spinner";
import usePagination from "@/hooks/usePagination";

declare const __userData: UserData;

const Saved = () => {
	const [savedPosts, setSavedPosts] = useState<PostData[] | null>(null);
	const [pauseScroll, setPauseScroll] = useState(false);
	const page = useRef(1);

	const getSavedPosts = async () => {
		try {
			setPauseScroll(true);
			const rawData = await request(
				`/api/posts/savedposts/?page=${page.current}`
			);
			const data = await rawData.json();

			if (data.ok) {
				if (data.code === "END_OF_PAGE") {
					setPauseScroll(true);
					return;
				}
				setPauseScroll(false);
				setSavedPosts((old) => {
					if (old === null) return data.data;
					return [...old, ...data.data];
				});
				return;
			}
			alert(data.message);
			setPauseScroll(false);
		} catch (err) {
			setPauseScroll(false);
			console.log(err);
			alert("Error fetching saved posts!");
		}
	};

	useEffect(() => {
		getSavedPosts();
	}, []);

	usePagination(
		null,
		100,
		() => {
			page.current++;
			getSavedPosts();
		},
		pauseScroll
	);

	return (
		<div className={`main ${classes.container}`}>
			<Nav />
			<div className={`pad container`}>
				<h2>Saved Posts :</h2>
				{savedPosts === null ? (
					<div className='flx-c'>
						<Spinner />
					</div>
				) : savedPosts.length === 0 ? (
					<div className={`flx-c`}>
						<h2>No saved posts</h2>
					</div>
				) : (
					savedPosts.map((post, i) => <PostView key={i} postData={post} />)
				)}
			</div>
		</div>
	);
};

render(<Saved />, document.getElementById("root") as HTMLElement);
