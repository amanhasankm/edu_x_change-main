import { JSX } from "preact";
import classes from "./Select.module.css";

type Props = {
	name?: string;
	id?: string;
	className?: string;
	options?: { name: string; value: string }[];
	noEmpty?: boolean;
	onInput?: JSX.GenericEventHandler<HTMLSelectElement>;
	value?: string;
};

const Select = (props: Props) => {
	return (
		<select
			name={props.name}
			id={props.id}
			onInput={props.onInput}
			value={props.value}
			className={`lite-shadow ${props.className || ""} ${classes.select}`}
		>
			{props.noEmpty ? null : <option value=''>---</option>}
			{props.options?.map((option, i) => (
				<option value={option.value} key={i}>
					{option.name}
				</option>
			))}
		</select>
	);
};

export default Select;
