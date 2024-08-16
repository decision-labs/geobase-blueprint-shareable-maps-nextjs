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
import { useTheme } from "next-themes";
import { useMapController } from "./map-controller";

export function AccountMenu({ setShowAccountDetails }: { setShowAccountDetails: (show: boolean) => void }) {
	const supabase = useSupabase();
	const mapController = useMapController();
	const theme = useTheme();
	const signOut = async () => {
		if (mapController) {
			mapController.setLoadingMessage("Signing out...");
			await supabase.client.auth.signOut();
			mapController.setLoadingMessage("");
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className="shadow-sm hover:opacity-80 rounded-full">
					<Avatar className="h-7 w-7">
						<AvatarImage src={supabase.profile?.photo_url} alt="Avatar" />
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
