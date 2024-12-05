interface Props {
	className?: string;
	width?: string;
	color?: string;
}

const Cross = (props: Props) => {
	return (
		<svg
			height={props.width || "32"}
			width={props.width || "32"}
			fill='none'
			viewBox='0 0 32 32'
			xmlns='http://www.w3.org/2000/svg'
			className={props.className}
		>
			<path
				d='M26.7543 1.84812L1.93588 26.739C0.996174 27.6814 1.02471 29.2381 1.99959 30.2158C2.97447 31.1935 4.52655 31.2221 5.46626 30.2797L30.2847 5.3888C31.2244 4.44635 31.1959 2.88974 30.221 1.912C29.2461 0.934275 27.694 0.905672 26.7543 1.84812Z'
				fill={props.color || "black"}
			/>
			<path
				d='M30.0642 26.739L5.24573 1.8481C4.30602 0.90565 2.75393 0.934265 1.77904 1.91199C0.80416 2.88972 0.775643 4.44633 1.71535 5.38878L26.5338 30.2796C27.4735 31.2221 29.0256 31.1935 30.0005 30.2158C30.9754 29.238 31.0039 27.6814 30.0642 26.739Z'
				fill={props.color || "black"}
			/>
		</svg>
	);
};

export default Cross;
