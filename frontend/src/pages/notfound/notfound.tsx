import Nav from "@/components/Nav/Nav";
import { render } from "preact";

import classes from "./notfound.module.css";

const NotFound = () => {
	return (
		<div className={`${classes.container} main`}>
			<Nav />
			<div className={`container`}>
				<div className={classes.content}>
					<h2>Error 404</h2>
					<h1>Page Not Found!</h1>
				</div>
			</div>
		</div>
	);
};

render(<NotFound />, document.getElementById("root") as HTMLElement);
