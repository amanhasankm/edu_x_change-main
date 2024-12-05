import classes from "./Spinner.module.css";

type Props = {
	className?: string;
};

const Spinner = (props: Props) => {
	return (
		<div className={`${classes.container} ${props.className || ""}`}>
			<div></div>
			<div></div>
			<div></div>
			<div></div>
		</div>
	);
};

export default Spinner;
