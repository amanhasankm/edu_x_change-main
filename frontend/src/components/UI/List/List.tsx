import { JSX } from "preact";

import classes from "./List.module.css";

type Props = {
	items?: {
		name: string;
		onClick?: JSX.MouseEventHandler<HTMLLIElement>;
		link?: string;
	}[];
	className?: string;
	style?: JSX.CSSProperties;
};

const List = (props: Props) => {
	return (
		<ul
			style={props.style}
			className={`${props.className || ""} ${classes.container}`}
		>
			{props.items?.map((item, i) => (
				<li
					className={`${classes.item} flx-c`}
					key={i}
					onClick={item.link ? undefined : item.onClick}
				>
					{item.link ? (
						<a href={item.link} className={`flx-c ${classes.link}`}>
							{item.name}
						</a>
					) : (
						item.name
					)}
				</li>
			))}
		</ul>
	);
};

export default List;
