import { cn } from "@/lib/utils";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import Link from "next/link";
import { MaterialSymbol } from "react-material-symbols";
import { Button } from "../ui/button";
import { MapMenu } from "./map-menu";
import { ScrollArea } from "../ui/scroll-area";
import { useMapProject } from "../project-layout";

export function Sidebar({
	showSidebar,
	setShowSidebar,
}: {
	showSidebar: boolean;
	setShowSidebar: (showSidebar: boolean) => void;
}) {
	const { mapProject } = useMapProject();
	return (
		<aside
			className={cn(
				"absolute flex flex-col gap-2 w-72 h-auto top-4 left-4 bottom-4 rounded-xl bg-white/30 dark:bg-zinc-600/30 backdrop-blur-md border border-transparent dark:border-zinc-800 shadow-xl z-50 text-base transition duration-200 ease-in-out",
				showSidebar ? "translate-x-0" : "-translate-x-[150%]",
			)}
		>
			<ResizablePanelGroup direction="vertical">
				<ResizablePanel className="p-3 flex flex-col gap-2">
					<h2 className="pb-2 flex items-center gap-4 justify-between text-sm font-semibold">
						{mapProject?.title}
						<MapMenu />
					</h2>
					<ScrollArea>
						<div className="flex flex-col gap-2">
							<button className="focus:outline-none flex items-center justify-between">
								📍 Alexanderplatz
							</button>
							<button className="focus:outline-none flex items-center justify-between">
								📍 Brandenburger Tor
							</button>
						</div>
					</ScrollArea>
				</ResizablePanel>
				<ResizableHandle withHandle />
				<ResizablePanel className="p-3 flex flex-col gap-1">
					<h2 className="pb-2 flex items-center gap-4 justify-between text-sm font-semibold">
						My Maps
						<Button variant={"ghost"} size={"icon"}>
							<MaterialSymbol icon="add" size={20} />
						</Button>
					</h2>
					<ScrollArea>
						<div className="flex flex-col gap-1">
							<Link
								href="/"
								className="rounded-lg bg-white/50 dark:bg-zinc-600/20 hover:bg-white/80 dark:hover:bg-zinc-700/50 border border-transparent dark:border-zinc-700/50 transition p-2 flex items-center justify-between"
							>
								GDL 🎻
								<MaterialSymbol icon="chevron_right" />
							</Link>
							<Link
								href="/"
								className="rounded-lg bg-white/50 dark:bg-zinc-600/20 hover:bg-white/80 dark:hover:bg-zinc-700/50 border border-transparent dark:border-zinc-700/50 transition p-2 flex items-center justify-between"
							>
								Berlin 🍺
								<MaterialSymbol icon="chevron_right" />
							</Link>
							<Link
								href="/"
								className="rounded-lg bg-white/50 dark:bg-zinc-600/20 hover:bg-white/80 dark:hover:bg-zinc-700/50 border border-transparent dark:border-zinc-700/50 transition p-2 flex items-center justify-between"
							>
								CDMX 🌮
								<MaterialSymbol icon="chevron_right" />
							</Link>
						</div>
					</ScrollArea>
				</ResizablePanel>
			</ResizablePanelGroup>
		</aside>
	);
}
