import { JSX, ComponentChild } from "preact";

import Upload from "@/assets/icons/Upload";
import classes from "./FileInput.module.css";
import AddPicture from "@/assets/icons/AddPicture";

type Props = {
	className?: string;
	id?: string;
	required?: boolean;
	name?: string;
	whiteLbl?: boolean;
	onInput?: JSX.GenericEventHandler<HTMLInputElement>;
	placeholder?: ComponentChild;
	accept?: string;
	image?: boolean;
	text?: string;
	preview?: string;
	width?: string;
	multiple?: boolean;
};

const FileInput = (props: Props) => {
	return (
		<div className={`${classes.container} ${props.className || ""}`}>
			{!props.image ? (
				<div
					className={`${classes.inpContainer} ${classes.fileInpContainer} lite-shadow`}
				>
					{props.text}
					<Upload color='#fff' className='ml-10' width='22' />
				</div>
			) : (
				<>
					<div
						className={`${classes.inpContainer} ${classes.imgInpContainer} lite-shadow`}
					>
						<AddPicture width='58' color='var(--black)' />
					</div>
					{props.preview ? (
						<img
							src={props.preview}
							className={`${classes.inpContainer} ${classes.imgInpContainer}`}
						/>
					) : null}
				</>
			)}
			<input
				type='file'
				id={props.id}
				name={props.name}
				required={props.required}
				multiple={props.multiple}
				accept={props.accept}
				onInput={props.onInput}
				style={props.width ? { width: props.width } : undefined}
				className={`${props.image ? `mb-10 ${classes.imgInp}` : classes.inp}`}
			/>
			<br />
			<label htmlFor={props.id}>{props.placeholder}</label>
		</div>
	);
};

export default FileInput;
