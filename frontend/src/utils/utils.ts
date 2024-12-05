function request(path: string, body?: any, method = "GET") {
	return fetch(path, {
		method,
		headers: new Headers({
			"X-CSRFToken": getCookie("csrftoken") || "",
		}),
		body,
	});
}

function isValidUsername(username: string) {
	return /^[a-z0-9_]{3,20}$/.test(username);
}

function isValidEmail(email: string) {
	return /^[a-z0-9+_-]+@[a-z0-9]+\.{1}[a-z0-9]{2,10}$/.test(email);
}

function isValidCommunityName(name: string, min = 3) {
	const reg = new RegExp(`^(?!.*[A-Z])[\\w!$^*()|{}.+_\\-\\[\\]@]{${min},25}$`);
	return reg.test(name);
}

function getCookie(cName: string) {
	const cookies = document.cookie.split(";");
	for (let i = 0; i < cookies.length; i++) {
		const cookie = cookies[i].trim();
		const parts = cookie.split("=");
		const cookieName = parts[0];
		const cookieValue = parts[1];
		if (cookieName === cName) {
			return cookieValue;
		}
	}
	return null;
}

function debounce(cb: (...args: any[]) => void, delay = 1000) {
	let timeout: number;

	return (...args: any[]) => {
		window.clearTimeout(timeout);
		timeout = window.setTimeout(() => cb(...args), delay);
	};
}

const avatars = [1, 2, 3, 4, 5, 6, 7, 8, 9];

export {
	request,
	isValidEmail,
	isValidUsername,
	getCookie,
	debounce,
	isValidCommunityName,
	avatars,
};
