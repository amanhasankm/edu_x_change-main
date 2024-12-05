import { render, JSX } from "preact";
import { useEffect, useState } from "preact/hooks";

import Nav from "@/components/Nav/Nav";
import classes from "./profile.module.css";
import { CommunityData, UserData } from "@/utils/types";
import { avatars, isValidEmail, isValidUsername, request } from "@/utils/utils";
import Input from "@/components/UI/Input/Input";
import Card from "@/components/Card/Card";
import Spinner from "@/components/UI/Spinner/Spinner";
import Button from "@/components/UI/Button/Button";
import usePortal from "@/hooks/usePortal";

declare const __userData: UserData;

type InpData = {
	id: string;
	type: string;
	isValid: () => boolean;
	value: string;
	placeholder: string;
};

type InpEvent = JSX.TargetedEvent<HTMLInputElement | HTMLTextAreaElement>;

const Profile = () => {
	if (!__userData) {
		location.pathname = "/";
		return <span>Something wen't wrong</span>;
	}

	const initSignUpData: InpData[] = [
		{
			id: "userName",
			type: "text",
			isValid: () => initSignUpData[0].value.length >= 2,
			value: __userData.name,
			placeholder: "Name",
		},
		{
			id: "userUsername",
			type: "text",
			isValid: () => isValidUsername(initSignUpData[1].value),
			value: __userData.username,
			placeholder: "Username",
		},
		{
			id: "userEmail",
			type: "email",
			isValid: () => isValidEmail(initSignUpData[2].value),
			value: __userData.email,
			placeholder: "Email",
		},
		{
			id: "userPassword",
			type: "password",
			isValid: () => initSignUpData[3].value.length >= 8,
			value: "",
			placeholder: "Old password",
		},
		{
			id: "userNewPassword",
			type: "password",
			isValid: () => initSignUpData[4].value.length >= 8,
			value: "",
			placeholder: "New password",
		},
	];

	const [userDataInpState, setUserDataInpState] = useState(initSignUpData);
	const [communityJoined, setCommunityJoined] = useState<
		CommunityData[] | null
	>(null);
	const [messageData, setMessageData] = useState<{
		message: string;
		type: "error" | "success";
	} | null>(null);
	const [showAvatarSelection, setShowAvatarSelection] = useState(false);
	const [avatarId, setAvatarId] = useState<number>(
		parseInt(__userData.avatar.match(/\d+/g)![0])
	);

	const getCommunityJoined = async () => {
		try {
			const rawData = await request(`/api/community/mycommunities/`);
			const data = await rawData.json();
			if (data.ok) {
				setCommunityJoined(data.data);
				return;
			}

			alert(data.message);
		} catch (err) {
			console.error(err);
			alert("Something went wrong");
		}
	};

	const onCommunityLeaveClick = async (cName: string) => {
		if (!confirm("Are you sure you want to leave this community?")) {
			return;
		}

		try {
			const rawData = await request(`/api/community/leave/${cName}/`);
			const data = await rawData.json();
			if (data.ok) {
				await getCommunityJoined();
				return;
			}
		} catch (err) {
			console.error(err);
			alert("Something went wrong while leaving the community");
		}
	};

	const onAvatarChange = (id: number) => {
		setAvatarId(id);
		setShowAvatarSelection(false);
	};

	useEffect(() => {
		getCommunityJoined();
	}, []);

	usePortal(
		<Card heading='Select your Avatar :' boldHead>
			<div className={classes.avatars}>
				{avatars.map((id) => (
					<img
						width='100px'
						height='100px'
						key={id}
						src={`/static/imgs/p${id}.jpg`}
						alt={`Person ${id}`}
						className={`lite-shadow`}
						onClick={() => onAvatarChange(id)}
					/>
				))}
			</div>
		</Card>,
		{
			show: showAvatarSelection,
			onBackdropClick: () => setShowAvatarSelection(false),
		}
	);

	const onAvatarClick = () => {
		setShowAvatarSelection(true);
	};

	const onInput = (e: InpEvent, i: number) => {
		setUserDataInpState((oldData) => {
			const newData = [...oldData];

			newData[i].value = e.currentTarget.value;
			return newData;
		});
	};

	const onUpdateClick = async () => {
		const [name, username, email, oldPassword, newPassword] = [
			...userDataInpState,
		];
		const compulsoryField = [name, username, email];
		if (!compulsoryField.every((ele) => ele.isValid())) {
			setMessageData({
				message: "Every field must be valid",
				type: "error",
			});
			return;
		}

		if (newPassword.value !== "") {
			if (oldPassword.value === "") {
				setMessageData({
					message: "Old password cannot be empty",
					type: "error",
				});
				return;
			}

			if (!confirm("Updating password will log you out. Are you sure ?")) {
				return;
			}
		}

		try {
			const formData = new FormData();
			if (__userData.name !== userDataInpState[0].value)
				formData.append("fullName", userDataInpState[0].value);
			if (__userData.username !== userDataInpState[1].value)
				formData.append("username", userDataInpState[1].value);
			if (__userData.email !== userDataInpState[2].value)
				formData.append("email", userDataInpState[2].value);
			if (userDataInpState[3].value !== "")
				formData.append("oldPassword", userDataInpState[3].value);
			if (userDataInpState[3].value !== "")
				formData.append("newPassword", userDataInpState[4].value);
			if (parseInt(__userData.avatar.match(/\d+/g)![0]) !== avatarId)
				formData.append("avatar", avatarId.toString());

			const rawData = await request(`/api/users/update/`, formData, "POST");
			const data = await rawData.json();

			if (data.ok) {
				setMessageData({
					message: data.message,
					type: "success",
				});
				location.reload();
				return;
			}
			setMessageData({
				message: data.message,
				type: "error",
			});
		} catch (err) {
			console.log(err);
			alert("Something went wrong while updating your profile");
		}
	};

	return (
		<div className={`main ${classes.container}`}>
			<Nav />
			<div className={`pad container`}>
				<h2>Profile :</h2>
				<div className={`mt-20 ${classes.profileContainer}`}>
					<div>
						<div className={`${classes.avatarContainer}`}>
							<img
								src={`/static/imgs/p${avatarId}.jpg`}
								width='150px'
								height='150px'
								className={`lite-shadow`}
								onClick={onAvatarClick}
							/>
							<h3 className={`mt-20`}>{__userData.name}</h3>
						</div>
						<h4 className={`mt-20 mb-10`}>Edit :</h4>
						<div className={classes.inpContainer}>
							{userDataInpState.map((eleData, i) => (
								<Input
									key={i}
									id={eleData.id}
									type={eleData.type}
									placeholder={eleData.placeholder}
									name={`form-${eleData.id}`}
									required
									value={eleData.value}
									onInput={(e) => onInput(e, i)}
									isValid={eleData.isValid()}
									className={`mt-30 ${classes.inp}`}
								/>
							))}
						</div>
						<p
							className={`mt-10 mb-10 ${classes.message}`}
							data-type={messageData?.type}
						>
							{messageData?.message}
						</p>
						<Button onClick={onUpdateClick}>Update</Button>
					</div>

					<div>
						<Card
							className={classes.card}
							noMargin
							heading={"Communities Joined :"}
							boldHead
							color='yellow'
						>
							<ul className={classes.listContainer}>
								{communityJoined === null ? (
									<Spinner />
								) : communityJoined.length === 0 ? (
									<h3>No communities joined</h3>
								) : (
									communityJoined.map((item, i) => (
										<li key={i}>
											<div className={`mb-10 mt-10 ${classes.list}`}>
												<a
													href={`/x/${item.name}`}
													className={`mr-20 ${classes.lhs}`}
												>
													<img
														src={item.iconPath}
														alt={item.name}
														width={"40px"}
														height={"40px"}
														className={`mr-10 ${classes.icon}`}
													/>
													<div className={classes.nameContainer}>
														<span className={classes.name}>{item.name}</span>
														<span className={classes.desc}>{item.topic}</span>
													</div>
												</a>
												<span>
													<Button
														color='red'
														onClick={() => onCommunityLeaveClick(item.name)}
													>
														Leave
													</Button>
												</span>
											</div>
											<hr />
										</li>
									))
								)}
							</ul>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
};

render(<Profile />, document.getElementById("root") as HTMLElement);
