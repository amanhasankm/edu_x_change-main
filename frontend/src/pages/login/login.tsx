import { render } from "preact";

import LoginForm from "@/components/LoginForm/LoginForm";

import classes from "./login.module.css";

const LoginPage = () => (
	<div className={classes.container}>
		<LoginForm />
	</div>
);

render(<LoginPage />, document.getElementById("root") as HTMLElement);
