import { cn } from "@/lib/utils";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import Link from "next/link";
import { MaterialSymbol } from "react-material-symbols";
import { Button } from "../ui/button";
import { MapMenu } from "./map-menu";
import { ScrollArea } from "../ui/scroll-area";
import { MapProject, useMapProject } from "../project-layout";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSupabase } from "../supabase-provider";
import { useToast } from "../ui/use-toast";
import { CreateMapDialog } from "./create-map-dialog";

export function Sidebar({
	showSidebar,
	setShowSidebar,
}: {
	showSidebar: boolean;
	setShowSidebar: (showSidebar: boolean) => void;
}) {
	const { toast } = useToast();
	const router = useRouter();
	const supabase = useSupabase();
	const { mapProject } = useMapProject();
	const [userProjects, setUserProjects] = useState<MapProject[]>([]);
	const [shouldRefresh, setShouldRefresh] = useState(false);
	const [mapItems, setMapItems] = useState<any[]>([]);

	const fetchUserProjects = async () => {
		if (!supabase.session.current) return;
		console.log("Fetching user projects");
		let { data, error } = await supabase.client
			.from("smb_map_projects")
			.select("*")
			.eq("profile_id", supabase.session.current.user.id);

		if (error) {
			console.error("Error fetching user projects", error);
			toast({
				description: <span className="text-red-500">Could not fetch projects</span>,
			});
			return;
		}

		if (data) {
			let projects = data as MapProject[];
			projects = projects.sort((a, b) => a.title.localeCompare(b.title));
			setUserProjects(projects);
		}
	};

	useEffect(() => {
		if (showSidebar) fetchUserProjects();
	}, [showSidebar]);

	useEffect(() => {
		if (shouldRefresh) {
			fetchUserProjects();
			setShouldRefresh(false);
		}
	}, [shouldRefresh]);

	return (
		<aside
			className={cn(
				"absolute flex flex-col gap-2 w-72 h-auto top-4 left-4 bottom-4 rounded-xl bg-white/30 dark:bg-zinc-600/30 backdrop-blur-md border border-transparent dark:border-zinc-700/50 shadow-xl z-50 text-base transition duration-200 ease-in-out",
				showSidebar ? "translate-x-0" : "-translate-x-[150%]",
			)}
		>
			<ResizablePanelGroup direction="vertical">
				{mapProject ? (
					<>
						<ResizablePanel
							order={1}
							key="map-items"
							id="map-items-panel"
							className="p-3 flex flex-col gap-2"
						>
							<h2 className="pb-2 flex items-center gap-4 justify-between text-sm font-semibold">
								{mapProject?.title}
								<MapMenu project={{ ...mapProject }} setShouldRefresh={setShouldRefresh} />
							</h2>
							<ScrollArea>
								{mapItems.length > 0 ? (
									<div className="flex flex-col gap-2">
										{mapItems.map((item, i) => (
											<button
												key={i}
												className="focus:outline-none flex items-center justify-between"
											>
												📍 Pin {i}
											</button>
										))}
									</div>
								) : (
									<div className="text-sm opacity-50 w-full text-center">
										Nothing placed on your map yet.
									</div>
								)}
							</ScrollArea>
						</ResizablePanel>
						<ResizableHandle withHandle />
					</>
				) : null}
				<ResizablePanel order={2} key="map-list" id="map-list-panel" className="p-3 flex flex-col gap-1">
					<h2 className="pb-2 flex items-center gap-4 justify-between text-sm font-semibold">
						My Maps
						<CreateMapDialog
							variant="icon"
							setShowSidebar={setShowSidebar}
							showSidebar={showSidebar}
							setShouldRefresh={setShouldRefresh}
						/>
					</h2>
					<ScrollArea>
						{userProjects.length > 0 ? (
							<div className="flex flex-col gap-1">
								{userProjects.map((project) => (
									<div key={project.id} className="relative">
										<Link
											onClick={() => {
												fetchUserProjects();
											}}
											href={`/maps/${project.uuid}`}
											className={cn(
												"rounded-lg border border-transparent dark:border-zinc-600/50 transition p-2 flex items-center gap-3 w-full",
												mapProject && project.id === mapProject.id
													? "bg-white/80 dark:bg-zinc-500/50"
													: "bg-white/50 dark:bg-zinc-500/20 hover:bg-white/80 dark:hover:bg-zinc-500/40",
											)}
										>
											{mapProject && project.id === mapProject.id ? (
												mapProject.title
											) : (
												<>{project.title}</>
											)}
										</Link>
										<MapMenu
											project={{ ...project }}
											setShouldRefresh={setShouldRefresh}
											className="absolute right-1 -mr-px top-1/2 -translate-y-1/2"
										/>
									</div>
								))}
							</div>
						) : (
							<div className="text-sm opacity-50 w-full text-center">No maps yet</div>
						)}
					</ScrollArea>
				</ResizablePanel>
			</ResizablePanelGroup>
		</aside>
	);
}
