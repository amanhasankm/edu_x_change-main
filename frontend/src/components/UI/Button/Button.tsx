import { ComponentChild, JSX } from "preact";

import Spinner from "@/components/UI/Spinner/Spinner";

import classes from "./Button.module.css";

type Props = {
	children: ComponentChild;
	loading?: boolean;
	disabled?: boolean;
	onClick?: JSX.MouseEventHandler<HTMLButtonElement>;
	color?: "yellow" | "red" | "orange" | "transp";
	size?: "large";
	noShadow?: boolean;
	className?: string;
	type?: string;
	noPad?: boolean;
};

const Button = (props: Props) => {
	return (
		<>
			<button
				className={`${classes.btn} ${props.color ? classes[props.color] : ""} ${
					props.size ? classes[props.size] : ""
				} ${props.noShadow ? classes.noShadow : ""} ${
					props.noPad ? "" : classes.pad
				} ${props.className || ""}`}
				onClick={props.onClick}
				disabled={props.loading ? true : props.disabled}
				type={props.type}
			>
				{props.loading ? <Spinner className={classes.spinner} /> : null}
				<div className={props.loading ? classes.hide : undefined}>
					{props.children}
				</div>
			</button>
		</>
	);
};

export default Button;
