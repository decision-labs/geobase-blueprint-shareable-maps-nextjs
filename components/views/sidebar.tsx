import { cn } from "@/lib/utils";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import Link from "next/link";
import { MaterialSymbol } from "react-material-symbols";
import { MapMenu } from "./map-menu";
import { ScrollArea } from "../ui/scroll-area";
import { MapProject, useMapProject } from "@/components/providers/project-provider";
import { useEffect, useState } from "react";
import { useGeobase } from "@/components/providers/geobase-provider";
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
	const geobase = useGeobase();
	const { mapProject } = useMapProject();
	const [userProjects, setUserProjects] = useState<MapProject[]>([]);
	const [shouldRefresh, setShouldRefresh] = useState(false);
	const [mapPins, setMapItems] = useState<any[]>([]);

	const fetchMapItems = async () => {
		if (!mapProject) return;

		let { data: pinsData, error: pinsError } = await geobase.supabase
			.from("smb_pins")
			.select("id, meta")
			.eq("project_id", mapProject.id);

		let { data: annotationsData, error: annotationsError } = await geobase.supabase
			.from("smb_annotations")
			.select("id, meta")
			.eq("project_id", mapProject.id);

		if (pinsError || annotationsError) {
			console.error("Error fetching map items", pinsError || annotationsError);
			toast({
				description: <span className="text-red-500">Could not fetch map items</span>,
			});
			return;
		}

		if (pinsData && annotationsData) {
			let pins = pinsData.map((item) => ({ ...item, type: "pin" }));
			let annotations = annotationsData.map((item) => ({ ...item, type: "annotation" }));
			let allItems = [...pins, ...annotations];
			setMapItems(allItems);
		}
	};

	const fetchUserProjects = async () => {
		if (!geobase.sessionRef.current) return;
		console.log("Fetching user projects");
		let { data, error } = await geobase.supabase
			.from("smb_map_projects")
			.select("*")
			.eq("profile_id", geobase.sessionRef.current.user.id);

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

	const getCoords = (meta: string) => {
		try {
			const { lng, lat, color } = JSON.parse(meta);
			return `${Number(lng).toFixed(5)}, ${Number(lat).toFixed(5)}`;
		} catch (e) {
			console.log("failed to parse pin meta", e);
		}
	};

	useEffect(() => {
		if (showSidebar) {
			fetchMapItems();
			fetchUserProjects();
		}
	}, [showSidebar]);

	useEffect(() => {
		if (shouldRefresh) {
			fetchUserProjects();
			fetchMapItems();
			setShouldRefresh(false);
		}
	}, [shouldRefresh]);

	useEffect(() => {
		if (mapProject) {
			fetchUserProjects();
			fetchMapItems();
		}
	}, [mapProject]);

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
								{mapPins.length > 0 ? (
									<div className="flex flex-col gap-2">
										{mapPins.map((item, i) => (
											<div
												key={i}
												className="focus:outline-none flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-300"
											>
												{item.type === "pin"
													? `📍 ${getCoords(item.meta)}`
													: `💬 "${item.meta}"`}
											</div>
										))}
									</div>
								) : (
									<div className="text-sm opacity-50 w-full text-center">
										Nothing placed on your map yet.
									</div>
								)}
							</ScrollArea>
						</ResizablePanel>
						{geobase.session ? <ResizableHandle withHandle /> : null}
					</>
				) : null}
				{geobase.session ? (
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
													"rounded-lg border border-transparent dark:border-zinc-600/50 transition p-2 flex items-center gap-1 justify-between w-full pr-10",
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
												{project.published ? (
													<MaterialSymbol
														title="Map published"
														icon="public"
														className="opacity-50 text-green-500"
													/>
												) : null}
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
				) : null}
			</ResizablePanelGroup>
		</aside>
	);
}
