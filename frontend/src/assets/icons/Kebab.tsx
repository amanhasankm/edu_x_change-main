type Props = {
	className?: string;
	width?: string;
};

const Kebab = (props: Props) => {
	return (
		<svg
			height='10'
			width={props.width || "46"}
			fill='none'
			viewBox='0 0 46 10'
			xmlns='http://www.w3.org/2000/svg'
			className={props.className}
		>
			<circle cx='5' cy='5' fill='black' r='5' />
			<circle cx='41' cy='5' fill='black' r='5' />
			<circle cx='23' cy='5' fill='black' r='5' />
		</svg>
	);
};

export default Kebab;
