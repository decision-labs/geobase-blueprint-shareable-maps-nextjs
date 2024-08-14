import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { MaterialSymbol } from "react-material-symbols";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useSupabase } from "../supabase-provider";

export function AccountDetails({
	showAccountDetails,
	setShowAccountDetails,
}: {
	showAccountDetails: boolean;
	setShowAccountDetails: (show: boolean) => void;
}) {
	const supabase = useSupabase();

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
			<button className="border border-zinc-200 bg-white shadow-sm hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-600/30 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 rounded-full p-0.5 w-fit">
				<Avatar className="h-32 w-32">
					<AvatarImage src={supabase.auth?.user.user_metadata.avatar_url} alt="Avatar" />
					<AvatarFallback>
						<MaterialSymbol icon="person" size={96} fill className="opacity-20" />
					</AvatarFallback>
				</Avatar>
			</button>
			<h2 className="text-lg mt-2">{supabase.auth?.user.email}</h2>
			<p className="text-sm opacity-60">20 Maps Created</p>
		</aside>
	);
}
