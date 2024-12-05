import { JSX } from "preact";
import { useState } from "preact/hooks";

import Card from "@/components/Card/Card";
import Input from "@/components/UI/Input/Input";
import FileInput from "@/components/UI/Input/FileInput";
import Button from "@/components/UI/Button/Button";

import classes from "./CreateCommunityCard.module.css";

import { isValidCommunityName, request } from "@/utils/utils";

type Props = {
	onCloseClick?: JSX.MouseEventHandler<HTMLDivElement>;
	defaultVal?: {
		commName: string;
		topic: string;
		description: string;
		icon?: File;
	};
	update?: boolean;
};

type ErrorMsg = {
	message: string;
	mode: "success" | "error" | "warn";
};

const CreateCommunityCard = (props: Props) => {
	const defIcon = props.defaultVal?.icon
		? {
				file: props.defaultVal.icon,
				url: URL.createObjectURL(props.defaultVal.icon),
		  }
		: undefined;
	const [iconInpData, setIconInpData] = useState<
		{ file: File; url: string } | undefined
	>(defIcon);
	const [textInpData, setTextInpData] = useState({
		commName: {
			name: "community-name",
			value: props.defaultVal?.commName || "",
		},
		topic: {
			name: "community-topic",
			value: props.defaultVal?.topic || "",
		},
		description: {
			name: "community-description",
			value: props.defaultVal?.description || "",
		},
	});
	const [errorMsg, setErrorMsg] = useState<ErrorMsg>({
		message: "",
		mode: "warn",
	});
	const [isLoading, setIsLoading] = useState(false);

	const onIconInput: JSX.GenericEventHandler<HTMLInputElement> = (e) => {
		const { files } = e.currentTarget;

		if (files && files.length !== 0) {
			const [file] = files;
			if (file.size > 1024 * 1024) {
				setErrorMsg({
					message: "Image size should be less than 1MB",
					mode: "error",
				});
				return;
			}
			setErrorMsg({ message: "", mode: "warn" });
			setIconInpData({
				file,
				url: URL.createObjectURL(file),
			});
		}
	};

	const onTextDataInput: JSX.GenericEventHandler<
		HTMLInputElement | HTMLTextAreaElement
	> = (e) => {
		const val = e.currentTarget.value;
		setTextInpData((prev) => {
			const newState = { ...prev };
			switch (e.currentTarget.name) {
				case newState.commName.name:
					const lowerName = val.toLowerCase();
					if (lowerName === "" || isValidCommunityName(lowerName, 1)) {
						setErrorMsg({
							message: "",
							mode: "warn",
						});
						newState.commName.value = lowerName;
						break;
					}
					setErrorMsg({
						message: "Invalid community name",
						mode: "error",
					});
					break;
				case newState.topic.name:
					newState.topic.value = val;
					break;
				case newState.description.name:
					newState.description.value = val;
					break;
			}
			return newState;
		});
	};

	const isFileEqual = (file1: File, file2: File) => {
		if (file1.name !== file2.name) return false;

		if (file1.size !== file2.size) return false;

		if (file1.type !== file2.type) return false;

		return true;
	};

	const onSubmit: JSX.GenericEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault();
		e.stopImmediatePropagation();

		if (
			isValidCommunityName(textInpData.commName.value) &&
			textInpData.topic.value.length > 2 &&
			textInpData.topic.value.length <= 25 &&
			textInpData.description.value.length <= 500
		) {
			const formData = new FormData();
			formData.append("communityName", textInpData.commName.value);
			formData.append("topic", textInpData.topic.value);
			formData.append("description", textInpData.description.value);

			if (iconInpData) {
				console.log("Adding icon file");
				if (!props.update) {
					formData.append("communityIcon", iconInpData.file);
				} else if (!props.defaultVal?.icon) {
					formData.append("communityIcon", iconInpData.file);
				} else if (!isFileEqual(iconInpData.file, props.defaultVal.icon)) {
					console.log("Adding icon file");
					formData.append("communityIcon", iconInpData.file);
				}
			}

			try {
				setIsLoading(true);
				const rawRes = await request(
					`/api/community/${
						props.update ? `update/${props.defaultVal?.commName}/` : "create/"
					}`,
					formData,
					"POST"
				);
				const res = await rawRes.json();
				console.log(res);
				setIsLoading(false);

				if (res.error) {
					setErrorMsg({
						message: res.message,
						mode: "error",
					});
				} else {
					setErrorMsg({
						message: res.message,
						mode: "success",
					});
					location.pathname = `/x/${res.data.name}`;
				}
			} catch (err) {
				setIsLoading(false);
				console.error(err);
			}
		} else {
			setErrorMsg({
				message: "Invalid input",
				mode: "error",
			});
		}
	};

	return (
		<>
			<Card
				className={`${classes.container}`}
				heading={`${props.update ? "Update" : "Create"} Community :`}
				boldHead
				icon='close'
				onIconClick={props.onCloseClick}
			>
				<form
					action={`/api/community/${
						props.update ? `update/${props.defaultVal?.commName}/` : "create/"
					}`}
					method='post'
					onSubmit={onSubmit}
				>
					<div className={`mt-10 mb-20 ${classes.wrapper}`}>
						<span className={`${classes.label}`}>Community icon :</span>
						<FileInput
							name='community-icon'
							id='communityIconPic'
							placeholder={
								iconInpData ? iconInpData.file.name : ".png / .jpg / .jpeg"
							}
							accept='.jpg, .jpeg, .png'
							text='Upload your community icon'
							image
							preview={iconInpData?.url}
							onInput={onIconInput}
							className={classes.inp}
						/>
						<span className={`${classes.label}`}>Name of your community :</span>
						<Input
							type='text'
							placeholder='Name'
							value={textInpData.commName.value}
							name={textInpData.commName.name}
							className={`${classes.inp}`}
							onInput={onTextDataInput}
							required
						/>
						<span className={`${classes.label}`}>Topic of discussion :</span>
						<Input
							type='text'
							placeholder='Topic'
							value={textInpData.topic.value}
							name={textInpData.topic.name}
							className={`${classes.inp}`}
							maxLength={25}
							onInput={onTextDataInput}
							required
						/>
						<span className={`${classes.label}`}>Description :</span>
						<Input
							type='textarea'
							placeholder='Description'
							value={textInpData.description.value}
							name={textInpData.description.name}
							className={`${classes.inp}`}
							onInput={onTextDataInput}
							resize='vertical'
						/>
					</div>
					<span className={classes.errorMsg} data-mode={errorMsg.mode}>
						{errorMsg.message}
					</span>
					<div className={`mt-20 flx-c`}>
						<Button loading={isLoading} type='submit' size='large'>
							{props.update ? "Update" : "Create"} community
						</Button>
					</div>
				</form>
			</Card>
		</>
	);
};

export default CreateCommunityCard;
