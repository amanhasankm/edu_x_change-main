import { JSX } from "preact";

import classes from "./Input.module.css";

type Props = {
	value: string;
	type?: string;
	placeholder?: string;
	className?: string;
	id?: string;
	required?: boolean;
	name?: string;
	whiteLbl?: boolean;
	onInput?: JSX.GenericEventHandler<HTMLInputElement | HTMLTextAreaElement>;
	borderClr?: string;
	noLbl?: boolean;
	resize?: "horizontal" | "vertical" | "none" | "both";
	isValid?: boolean;
	max?: number;
	maxLength?: number;
};

const Input = (props: Props) => {
	return (
		<div className={`${classes.container} ${props.className || ""}`}>
			{props.type !== "textarea" ? (
				<input
					id={props.id}
					value={props.value}
					type={props.type || "text"}
					placeholder={props.placeholder}
					required={props.required}
					name={props.name}
					className={`lite-shadow ${classes.input}`}
					data-valid={props.value === "" || props.isValid}
					onInput={props.onInput}
					max={props.max}
					maxLength={props.maxLength}
				/>
			) : (
				<textarea
					className={`lite-shadow ${classes.input} ${
						props.type === "textarea" ? classes.textArea : ""
					}`}
					placeholder={props.placeholder}
					data-resize={props.resize}
					onInput={props.onInput}
					name={props.name}
				>
					{props.value}
				</textarea>
			)}
			{props.noLbl ? null : (
				<label
					htmlFor={props.id}
					className={`${classes.lbl} ${props.whiteLbl ? classes.white : ""} ${
						props.type === "textarea" ? classes.txtAreaLbl : ""
					} ${props.value !== "" ? classes.levitate : ""}`}
				>
					{props.placeholder}
				</label>
			)}
		</div>
	);
};

export default Input;
