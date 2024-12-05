import { JSX } from "preact";
import Input from "./Input";

import classes from "./SearchInput.module.css";
import { CommunityData } from "@/utils/types";
import ProfileList from "../List/ProfileList";

type Props = {
	className?: string;
	id?: string;
	name?: string;
	whiteLbl?: boolean;
	onInput?: JSX.GenericEventHandler<HTMLInputElement | HTMLTextAreaElement>;
	placeholder?: string;
	value: string;
	suggestions?: CommunityData[];
};

const SearchInput = (props: Props) => {
	return (
		<div className={classes.container}>
			<Input
				className={props.className}
				id={props.id}
				name={props.name}
				whiteLbl={props.whiteLbl}
				onInput={props.onInput}
				placeholder={props.placeholder}
				value={props.value}
				type='search'
			/>
			{props.value !== "" &&
			props.suggestions &&
			props.suggestions.length === 0 ? (
				<ProfileList
					items={[{ name: "No results" }]}
					className={`${classes.listContainer}`}
				/>
			) : null}
			{props.suggestions && props.suggestions.length > 0 ? (
				<ProfileList
					items={props.suggestions.map((item) => ({
						name: item.name,
						link: `/x/${item.name}`,
						rhs: item.participantsCount,
						icon: item.iconPath,
						desc: item.topic,
					}))}
					className={`drop-shadow ${classes.listContainer}`}
				/>
			) : null}
		</div>
	);
};

export default SearchInput;
