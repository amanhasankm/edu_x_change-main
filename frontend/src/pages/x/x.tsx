import { render } from "preact";

import Nav from "@/components/Nav/Nav";
import classes from "./x.module.css";
import CommunityCard from "@/components/CommunityCard/CommunityCard";
import type { CommunityData } from "@/types";
import { useEffect } from "preact/hooks";

declare const __communityData: CommunityData | undefined;

const X = () => {
	if (!__communityData)
		return <span>Community not found or internal server error</span>;

	console.log(__communityData);

	useEffect(() => {
		document.title = __communityData.name;
	}, []);

	return (
		<div className={`${classes.container} main`}>
			<Nav />
			<main className={`container pad`}>
				<h2 className={`mb-30`}>Community :</h2>
				<CommunityCard data={__communityData} />
			</main>
		</div>
	);
};

render(<X />, document.getElementById("root") as HTMLElement);
