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

	const fetchUserProjects = async () => {
		if (!supabase.session.current) return;
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

		if (data && mapProject) {
			let projects = data as MapProject[];
			// Order alphabetically
			projects = projects.sort((a, b) => a.title.localeCompare(b.title));
			setUserProjects(projects);
		}
	};

	useEffect(() => {
		fetchUserProjects();
	}, [mapProject]);

	return (
		<aside
			className={cn(
				"absolute flex flex-col gap-2 w-72 h-auto top-4 left-4 bottom-4 rounded-xl bg-white/30 dark:bg-zinc-600/30 backdrop-blur-md border border-transparent dark:border-zinc-700/50 shadow-xl z-50 text-base transition duration-200 ease-in-out",
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
						<Button variant={"elevated"} size={"icon"} onClick={() => router.push("/new")}>
							<MaterialSymbol icon="add" size={20} />
						</Button>
					</h2>
					<ScrollArea>
						<div className="flex flex-col gap-1">
							{userProjects.map((project) => (
								<Link
									key={project.id}
									href={`/maps/${project.uuid}`}
									className={cn(
										"rounded-lg border border-transparent dark:border-zinc-600/50 transition p-2 flex items-center justify-between",
										mapProject && project.id === mapProject.id
											? "bg-white/80 dark:bg-zinc-500/50"
											: "bg-white/50 dark:bg-zinc-500/20 hover:bg-white/80 dark:hover:bg-zinc-500/40",
									)}
								>
									{mapProject && project.id === mapProject.id ? mapProject.title : project.title}
									<MaterialSymbol icon="chevron_right" />
								</Link>
							))}
						</div>
					</ScrollArea>
				</ResizablePanel>
			</ResizablePanelGroup>
		</aside>
	);
}
