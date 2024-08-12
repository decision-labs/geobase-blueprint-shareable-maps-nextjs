import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MaterialSymbol } from "react-material-symbols";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSupabase } from "../supabase-provider";

export function AccountMenu() {
	const supabase = useSupabase();
	const signOut = async () => {
		supabase.client.auth.signOut();
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className="border border-zinc-200 bg-white shadow-sm hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 rounded-full p-0.5">
					<Avatar className="h-7 w-7">
						<AvatarImage src={supabase.auth?.user.user_metadata.avatar_url} alt="Avatar" />
						<AvatarFallback>
							<MaterialSymbol icon="person" size={20} fill className="opacity-50" />
						</AvatarFallback>
					</Avatar>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="start" side="right" sideOffset={20} alignOffset={-15}>
				<DropdownMenuItem className="gap-2 items-center font-semibold">
					{supabase.auth?.user?.email}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="gap-2 items-center">
					<MaterialSymbol icon="settings" size={16} className="" />
					Account Settings
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="gap-2 items-center" onClick={signOut}>
					<MaterialSymbol icon="exit_to_app" size={16} className="" />
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
