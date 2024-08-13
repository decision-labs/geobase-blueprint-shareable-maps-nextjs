import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MaterialSymbol } from "react-material-symbols";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSupabase } from "../supabase-provider";
import { useContext } from "react";
import { MapViewContext } from "../views/map-view";
import { useTheme } from "next-themes";

export function AccountMenu({ setShowAccountDetails }: { setShowAccountDetails: (show: boolean) => void }) {
	const supabase = useSupabase();
	const mapView = useContext(MapViewContext);
	const theme = useTheme();
	const signOut = async () => {
		if (mapView.setLoadingMessage) {
			mapView.setLoadingMessage("Signing out...");
			await supabase.client.auth.signOut();
			mapView.setLoadingMessage("");
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className="border border-zinc-200 bg-white shadow-sm hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-600/30 hover:opacity-80 dark:hover:text-zinc-50 rounded-full p-0.5">
					<Avatar className="h-7 w-7">
						<AvatarImage src={supabase.auth?.user.user_metadata.avatar_url} alt="Avatar" />
						<AvatarFallback>
							<MaterialSymbol icon="person" size={20} fill className="opacity-50" />
						</AvatarFallback>
					</Avatar>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="start" side="right" sideOffset={20} alignOffset={-15}>
				<DropdownMenuItem
					className="gap-2 items-center font-semibold"
					onClick={() => setShowAccountDetails(true)}
				>
					{supabase.auth?.user?.email}
				</DropdownMenuItem>
				<DropdownMenuSeparator />
				<DropdownMenuSub>
					<DropdownMenuSubTrigger className="gap-2 items-center capitalize">
						<MaterialSymbol icon="settings" size={16} className="" />
						Theme: {theme.theme}
					</DropdownMenuSubTrigger>
					<DropdownMenuPortal>
						<DropdownMenuSubContent>
							<DropdownMenuItem className="gap-2 items-center" onClick={() => theme.setTheme("light")}>
								<MaterialSymbol icon="wb_sunny" size={16} className="" />
								Light
							</DropdownMenuItem>
							<DropdownMenuItem className="gap-2 items-center" onClick={() => theme.setTheme("dark")}>
								<MaterialSymbol icon="nights_stay" size={16} className="" />
								Dark
							</DropdownMenuItem>
							<DropdownMenuItem className="gap-2 items-center" onClick={() => theme.setTheme("system")}>
								<MaterialSymbol icon="display_settings" size={16} className="" />
								System
							</DropdownMenuItem>
						</DropdownMenuSubContent>
					</DropdownMenuPortal>
				</DropdownMenuSub>
				<DropdownMenuSeparator />
				<DropdownMenuItem className="gap-2 items-center text-red-500 hover:!text-red-500" onClick={signOut}>
					<MaterialSymbol icon="exit_to_app" size={16} className="" />
					Sign out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
