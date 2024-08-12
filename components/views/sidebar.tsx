import { cn } from "@/lib/utils";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import Link from "next/link";
import { MaterialSymbol } from "react-material-symbols";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function Sidebar({
	showSidebar,
	setShowSidebar,
}: {
	showSidebar: boolean;
	setShowSidebar: (showSidebar: boolean) => void;
}) {
	return (
		<aside
			className={cn(
				"absolute flex flex-col gap-2 w-72 h-auto top-4 left-4 bottom-4 rounded-xl bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md border border-transparent dark:border-zinc-800 shadow-xl z-50 text-base transition duration-200 ease-in-out",
				showSidebar ? "translate-x-0" : "-translate-x-[150%]",
			)}
		>
			<ResizablePanelGroup direction="vertical">
				<ResizablePanel className="p-3 flex flex-col gap-2">
					<h2 className="pb-2 flex items-center gap-4 justify-between">
						Berlin 🍺
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant={"ghost"} size={"icon"}>
									<MaterialSymbol icon="more_horiz" size={20} />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-56"
								align="start"
								side="right"
								sideOffset={20}
								alignOffset={-13}
							>
								<DropdownMenuItem className="gap-2 items-center">
									<MaterialSymbol icon="share" size={16} className="" />
									Share
								</DropdownMenuItem>
								<DropdownMenuItem className="gap-2 items-center">
									<MaterialSymbol icon="file_copy" size={16} className="" />
									Copy
								</DropdownMenuItem>
								<DropdownMenuItem className="gap-2 items-center">
									<MaterialSymbol icon="drive_file_rename_outline" size={16} className="" />
									Rename
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem className="gap-2 items-center text-red-500 hover:!text-red-500">
									<MaterialSymbol icon="delete" size={16} className="" />
									Delete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</h2>
					<Link href="/" className="flex items-center justify-between">
						📍 Alexanderplatz
					</Link>
					<Link href="/" className="flex items-center justify-between">
						📍 Brandenburger Tor
					</Link>
				</ResizablePanel>
				<ResizableHandle withHandle />
				<ResizablePanel className="p-3 flex flex-col gap-1">
					<h2 className="pb-2">My Maps</h2>
					<Link
						href="/"
						className="rounded-lg bg-white/50 dark:bg-zinc-950/20 hover:bg-white/80 dark:hover:bg-zinc-950/80 border border-transparent dark:border-zinc-900 transition p-2 flex items-center justify-between"
					>
						GDL 🎻
						<MaterialSymbol icon="chevron_right" />
					</Link>
					<Link
						href="/"
						className="rounded-lg bg-white/50 dark:bg-zinc-950/20 hover:bg-white/80 dark:hover:bg-zinc-950/80 border border-transparent dark:border-zinc-900 transition p-2 flex items-center justify-between"
					>
						Berlin 🍺
						<MaterialSymbol icon="chevron_right" />
					</Link>
					<Link
						href="/"
						className="rounded-lg bg-white/50 dark:bg-zinc-950/20 hover:bg-white/80 dark:hover:bg-zinc-950/80 border border-transparent dark:border-zinc-900 transition p-2 flex items-center justify-between"
					>
						CDMX 🌮
						<MaterialSymbol icon="chevron_right" />
					</Link>
				</ResizablePanel>
			</ResizablePanelGroup>
		</aside>
	);
}
