import { useEffect } from "preact/hooks";

const useScrollToBottom = (
	scrollElement = null,
	distance = 100,
	callback: () => void,
	pause?: boolean
) => {
	useEffect(() => {
		const handleScroll = () => {
			const element = scrollElement || document.documentElement;
			const scrollHeight = element.scrollHeight;
			const clientHeight = element.clientHeight;
			const scrollTop = element.scrollTop;

			if (scrollHeight - (scrollTop + clientHeight) <= distance) {
				if (!pause) callback();
			}
		};

		const target = scrollElement || window;
		target.addEventListener("scroll", handleScroll);

		return () => {
			target.removeEventListener("scroll", handleScroll);
		};
	}, [scrollElement, distance, callback]);
};

export default useScrollToBottom;
