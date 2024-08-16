import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { MaterialSymbol } from "react-material-symbols";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useSupabase } from "../supabase-provider";
import { useEffect, useState } from "react";
import { MapProject } from "../project-layout";

export function AccountDetails({
	showAccountDetails,
	setShowAccountDetails,
}: {
	showAccountDetails: boolean;
	setShowAccountDetails: (show: boolean) => void;
}) {
	const supabase = useSupabase();
	const [mapCount, setMapCount] = useState(0);

	const fetchMapCount = async () => {
		if (!supabase.session.current) return;
		let { data, error } = await supabase.client
			.from("smb_map_projects")
			.select("id")
			.eq("profile_id", supabase.session.current.user.id);

		if (error) {
			console.error("Error fetching user projects", error);
			return;
		}

		if (data) {
			let projects = data as MapProject[];
			setMapCount(projects.length);
		}
	};

	useEffect(() => {
		if (showAccountDetails) {
			fetchMapCount();
		}
	}, [showAccountDetails]);

	return (
		<aside
			className={cn(
				"absolute flex flex-col gap-2 items-center py-8 px-4 w-72 h-fit top-4 right-4 rounded-xl bg-white/30 dark:bg-zinc-600/30 backdrop-blur-md border border-transparent dark:border-zinc-700/50 shadow-xl z-50 text-base transition duration-200 ease-in-out",
				showAccountDetails ? "translate-x-0" : "translate-x-[150%]",
			)}
		>
			<Button
				variant="elevated"
				size="icon"
				className="absolute top-2 right-2"
				onClick={() => {
					setShowAccountDetails(false);
				}}
			>
				<MaterialSymbol icon="close" size={20} />
			</Button>
			<button className="rounded-full w-fit hover:opacity-80">
				<Avatar className="h-32 w-32">
					<AvatarImage src={supabase.profile?.photo_url} alt="Avatar" />
					<AvatarFallback>
						<MaterialSymbol icon="person" size={96} fill className="opacity-20" />
					</AvatarFallback>
				</Avatar>
			</button>
			<h2 className="text-lg mt-2">{supabase.profile?.nickname}</h2>
			<p className="text-sm opacity-60">{supabase.auth?.user.email}</p>
			<p className="text-sm opacity-60">{mapCount} Maps Created</p>
		</aside>
	);
}
