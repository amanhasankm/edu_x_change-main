interface Props {
	className?: string;
	color?: string;
	width?: string;
}

const Upload = (props: Props) => {
	return (
		<svg
			height={props.width || "32"}
			width={props.width || "32"}
			fill='none'
			viewBox='0 0 32 32'
			className={props.className}
			xmlns='http://www.w3.org/2000/svg'
		>
			<path
				d='M10.6667 14.6666H2.66667V28H29.3333V14.6666H21.3333V12H32V30.6666H0V12H10.6667V14.6666ZM9.33333 9.33331L16 1.33331L22.6667 9.33331H17.3333V24H14.6667V9.33331H9.33333Z'
				fill={props.color || "black"}
				fillRule='evenodd'
			/>
		</svg>
	);
};

export default Upload;
