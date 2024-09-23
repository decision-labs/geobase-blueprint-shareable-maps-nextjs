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
import { useGeobase } from "@/components/providers/geobase-provider";
import { useTheme } from "next-themes";
import { useMapController } from "./map-controller";
import { useMapProject } from "@/components/providers/project-provider";
import { useRouter } from "next/router";

export function AccountMenu({ setShowAccountDetails }: { setShowAccountDetails: (show: boolean) => void }) {
	const geobase = useGeobase();
	const router = useRouter();
	const mapController = useMapController();
	const { mapProject } = useMapProject();
	const theme = useTheme();
	const signOut = async () => {
		if (mapController) {
			mapController.setLoadingMessage("Signing out...");
			await geobase.supabase.auth.signOut();
			router.push("/sign-in");
			mapController.setLoadingMessage("");
		}
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<button className="shadow-sm hover:opacity-80 rounded-full">
					<Avatar className="h-7 w-7">
						<AvatarImage
							src={
								mapProject && mapProject.profile
									? mapProject.profile.photo_url
									: geobase.profile?.photo_url
							}
							alt="Avatar"
							className="object-cover"
						/>
						<AvatarFallback>
							<MaterialSymbol icon="person" size={20} fill className="opacity-50" />
						</AvatarFallback>
					</Avatar>
				</button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="start" side="right" sideOffset={20} alignOffset={-15}>
				{router.pathname === "/" && !geobase.session ? null : (
					<>
						<DropdownMenuItem
							className="gap-2 items-center font-semibold"
							onClick={() => setShowAccountDetails(true)}
						>
							{mapProject && mapProject.profile
								? mapProject.profile.nickname
								: geobase.session?.user?.email}
						</DropdownMenuItem>
						<DropdownMenuSeparator />
					</>
				)}
				<DropdownMenuSub>
					<DropdownMenuSubTrigger className="gap-2 items-center capitalize">
						<MaterialSymbol icon="settings" size={16} className="" />
						Theme: {theme.theme === "light" ? "Day" : theme.theme === "dark" ? "Night" : "System"}
					</DropdownMenuSubTrigger>
					<DropdownMenuPortal>
						<DropdownMenuSubContent>
							<DropdownMenuItem className="gap-2 items-center" onClick={() => theme.setTheme("light")}>
								<MaterialSymbol icon="wb_sunny" size={16} className="" />
								Day
							</DropdownMenuItem>
							<DropdownMenuItem className="gap-2 items-center" onClick={() => theme.setTheme("dark")}>
								<MaterialSymbol icon="nights_stay" size={16} className="" />
								Night
							</DropdownMenuItem>
							<DropdownMenuItem className="gap-2 items-center" onClick={() => theme.setTheme("system")}>
								<MaterialSymbol icon="display_settings" size={16} className="" />
								System
							</DropdownMenuItem>
						</DropdownMenuSubContent>
					</DropdownMenuPortal>
				</DropdownMenuSub>
				<DropdownMenuSeparator />
				{geobase.session ? (
					<DropdownMenuItem className="gap-2 items-center text-red-500 hover:!text-red-500" onClick={signOut}>
						<MaterialSymbol icon="exit_to_app" size={16} className="" />
						Sign out
					</DropdownMenuItem>
				) : (
					<DropdownMenuItem
						className="gap-2 items-center"
						onClick={() => {
							router.push("/sign-in");
						}}
					>
						<MaterialSymbol icon="login" size={16} className="" />
						Sign in
					</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
