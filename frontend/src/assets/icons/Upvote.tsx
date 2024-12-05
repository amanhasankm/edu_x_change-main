type Props = {
	className?: string;
	width?: string;
	fill?: boolean;
	down?: boolean;
};

const Upvote = (props: Props) => {
	return (
		<svg
			width={props.width || "34"}
			fill='none'
			viewBox='0 0 34 29'
			xmlns='http://www.w3.org/2000/svg'
			style={props.down ? { transform: "rotateX(180deg)" } : undefined}
		>
			<path
				d='M17 0L33.4545 28.5H0.545486L17 0Z'
				fill={props.fill ? "#D62828" : "#979797"}
			/>
		</svg>
	);
};

export default Upvote;
