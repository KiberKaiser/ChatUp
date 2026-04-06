import { Search, UserPlus, UserMinus, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";

const SearchFriendsPage = () => {
	const [query, setQuery] = useState("");
	const {
		friends,
		searchResults,
		isSearchingUsers,
		isUpdatingFriends,
		getFriends,
		searchUsersByNickname,
		addFriend,
		removeFriend,
	} = useAuthStore();

	useEffect(() => {
		getFriends();
	}, [getFriends]);

	const friendIds = useMemo(() => new Set(friends.map((friend) => friend._id)), [friends]);

	const handleSearch = async (e) => {
		e.preventDefault();
		await searchUsersByNickname(query);
	};

	const handleClear = async () => {
		setQuery("");
		await searchUsersByNickname("");
	};

	const renderUserCard = (user) => {
		const isFriend = user.isFriend ?? friendIds.has(user._id);
		return (
			<div
				key={user._id}
				className="rounded-xl border border-base-300 bg-base-100 p-4 flex items-center justify-between gap-3"
			>
				<div className="flex items-center gap-3 min-w-0">
					<img
						src={user.profilePic || "/avatar.png"}
						alt={user.fullName}
						className="size-12 rounded-full object-cover"
					/>
					<div className="min-w-0">
						<p className="font-medium truncate">{user.fullName}</p>
						<p className="text-sm text-base-content/70 truncate">@{user.nickname}</p>
					</div>
				</div>

				{isFriend ? (
					<button
						className="btn btn-outline btn-error btn-sm"
						disabled={isUpdatingFriends}
						onClick={() => removeFriend(user._id)}
					>
						<UserMinus className="size-4" />
						Remove
					</button>
				) : (
					<button
						className="btn btn-primary btn-sm"
						disabled={isUpdatingFriends}
						onClick={() => addFriend(user._id)}
					>
						<UserPlus className="size-4" />
						Add
					</button>
				)}
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-base-200 pt-20 pb-8 px-4">
			<div className="max-w-5xl mx-auto space-y-6">
				<div className="rounded-2xl bg-base-100 border border-base-300 p-5">
					<h1 className="text-2xl font-semibold">Find friends</h1>
					<p className="text-sm text-base-content/70 mt-1">
						Search users by nickname and manage your friend list.
					</p>

					<form onSubmit={handleSearch} className="mt-4 flex flex-col sm:flex-row gap-2">
						<label className="input input-bordered flex items-center gap-2 w-full">
							<Search className="size-4 text-base-content/60" />
							<input
								type="text"
								className="grow"
								value={query}
								onChange={(e) => setQuery(e.target.value.toLowerCase())}
								placeholder="Enter nickname, example: roman"
							/>
						</label>
						<button className="btn btn-primary" type="submit" disabled={isSearchingUsers}>
							{isSearchingUsers ? "Searching..." : "Search"}
						</button>
						<button className="btn btn-ghost" type="button" onClick={handleClear}>
							Clear
						</button>
					</form>
				</div>

				<div className="grid lg:grid-cols-2 gap-6">
					<section className="rounded-2xl bg-base-100 border border-base-300 p-5">
						<h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
							<Search className="size-5" />
							Search results
						</h2>
						<div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
							{searchResults.length > 0 ? (
								searchResults.map(renderUserCard)
							) : (
								<p className="text-sm text-base-content/60">No users found. Try another nickname.</p>
							)}
						</div>
					</section>

					<section className="rounded-2xl bg-base-100 border border-base-300 p-5">
						<h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
							<UsersRound className="size-5" />
							My friends ({friends.length})
						</h2>
						<div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
							{friends.length > 0 ? (
								friends.map(renderUserCard)
							) : (
								<p className="text-sm text-base-content/60">You have no friends yet.</p>
							)}
						</div>
					</section>
				</div>
			</div>
		</div>
	);
}

export default SearchFriendsPage;
