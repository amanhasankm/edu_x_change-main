import { useRef, useState } from "preact/hooks";

import Logo from "@/assets/logos/ExcWritten";
import Button from "@/components/UI/Button/Button";
import classes from "./Nav.module.css";
import usePortal from "@/hooks/usePortal";
import CreateCommunityCard from "@/components/CreateCommunity/CreateCommunityCard";
import SearchInput from "../UI/Input/SearchInput";
import { debounce, request } from "@/utils/utils";
import { CommunityData, UserData } from "@/utils/types";
import List from "../UI/List/List";

type Props = {};

declare const __userData: UserData;

const Nav = (_props: Props) => {
	const [showCreateCommunityCard, setShowCreateCommunityCard] = useState(false);
	const [searchVal, setSearchVal] = useState("");
	const [searchResults, setSearchResults] = useState<CommunityData[]>([]);
	const [showIconOptions, setShowIconOptions] = useState(false);

	const iconOptions = [
		{ name: "Profile", link: "/profile/" },
		{ name: "Saved Posts", link: "/saved/" },
		{
			name: "Create Community",
			onClick: () => setShowCreateCommunityCard(true),
		},
		{ name: "Logout", link: "/logout/" },
	];

	const toggleCreateCommunityCard = () => {
		setShowCreateCommunityCard((old) => !old);
	};

	usePortal(<CreateCommunityCard onCloseClick={toggleCreateCommunityCard} />, {
		show: showCreateCommunityCard,
		onBackdropClick: toggleCreateCommunityCard,
	});

	const searchCommunity = async (searchTerm: string) => {
		if (searchTerm === "") {
			setSearchResults([]);
			return;
		}

		try {
			const rawData = await request(`/api/community/search/${searchTerm}`);
			const data = await rawData.json();

			if (data.ok) {
				setSearchResults(data.data);
				return;
			}
		} catch (err) {
			console.error(err);
		}
	};

	const searchDebounceRef = useRef(debounce(searchCommunity, 250));

	const onIconClick = () => {
		setShowIconOptions((old) => !old);
	};

	return (
		<div className={`drop-shadow ${classes.container}`}>
			<div className={`container ${classes.wrapper}`}>
				<a href='/'>
					<Logo width='120' />
				</a>
				<div className={classes.searchContainer}>
					<SearchInput
						id='searchInp'
						name='search'
						placeholder='Search Community, topic'
						value={searchVal}
						className='fw'
						suggestions={searchResults}
						onInput={({ currentTarget: { value } }) => {
							setSearchVal(() => {
								searchDebounceRef.current(value);
								return value;
							});
						}}
					/>
				</div>
				<div className={classes.buttons}>
					{/* <Button onClick={toggleCreateCommunityCard} className='mr-20'>
						Community +
					</Button> */}
					<a href='/post/' className={`mr-20`}>
						<Button>Post +</Button>
					</a>
					<div className={`${classes.iconContainer}`}>
						<img
							src={__userData.avatar}
							width='50px'
							height='50px'
							className={`lite-shadow`}
							alt={__userData.username}
							onClick={onIconClick}
						/>
						{showIconOptions ? (
							<List
								items={iconOptions}
								className={`drop-shadow ${classes.iconOptions}`}
								style={{ bottom: `-${iconOptions.length * 50 + 15}px` }}
							/>
						) : null}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Nav;
