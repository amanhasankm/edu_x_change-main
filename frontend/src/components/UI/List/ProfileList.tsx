import { ComponentChild } from "preact";
import classes from "./List.module.css";

type Props = {
	items?: {
		name: string;
		link?: string;
		rhs?: ComponentChild;
		icon?: string;
		desc?: string;
	}[];
	className?: string;
};

const ProfileList = ({ items, ...props }: Props) => {
	return (
		<ul className={`${props.className || ""} ${classes.listContainer}`}>
			{items?.map((item, i) => (
				<li key={i}>
					<a href={item.link} className={`mb-10 mt-10 ${classes.list}`}>
						<div className={classes.lhs}>
							{item.icon ? (
								<img
									src={item.icon}
									alt={item.name}
									width={"40px"}
									height={"40px"}
									className={`mr-10 ${classes.icon}`}
								/>
							) : null}
							<div className={classes.nameContainer}>
								<span className={classes.name}>{item.name}</span>
								{item.desc ? (
									<span className={classes.desc}>{item.desc}</span>
								) : null}
							</div>
						</div>
					</a>
					<span className={classes.rhs}>{item.rhs}</span>
				</li>
			))}
		</ul>
	);
};

export default ProfileList;
