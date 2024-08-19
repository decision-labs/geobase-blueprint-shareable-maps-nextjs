import { MapProject, MapProjectContext, ProjectLayout } from "@/components/project-provider";
import { useGeobase } from "@/components/geobase-provider";
import { useToast } from "@/components/ui/use-toast";
import { MapController } from "@/components/views/map-controller";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

export default function MapPage() {
	const { toast } = useToast();
	const geobase = useGeobase();
	const router = useRouter();
	const [mapProject, setMapProject] = useState<MapProject | undefined>();
	const [loadingMessage, setLoadingMessage] = useState("Looking for your map project...");
	const [isFirstLoad, setIsFirstLoad] = useState(true);
	const isLoading = useRef(true);

	const updateMapProject = async (project: MapProject) => {
		let { data, error } = await geobase.supabase.from("smb_map_projects").update(project).eq("uuid", project.uuid);

		if (error) {
			console.error(error);
			toast({
				description: <span className="text-red-500">Failed to update project.</span>,
			});
			return;
		}

		console.log("Project updated");
	};

	const fetchMapProject = async (uuid: string) => {
		isLoading.current = true;
		let { data, error } = await geobase.supabase.from("smb_map_projects").select("*").eq("uuid", uuid);

		if (error) {
			console.error(error);
			return;
		}

		if (data && data.length > 0) {
			isLoading.current = false;
			return data[0] as MapProject;
		} else {
			isLoading.current = true;
			return undefined;
		}
	};

	useEffect(() => {
		const uuid = router.query.id as string | undefined;
		if (!uuid) return;
		if (uuid && !mapProject) {
			fetchMapProject(uuid).then((project) => {
				console.log("Project fetched:", project);
				setMapProject(project);
			});
		} else {
			setLoadingMessage("Getting map project data...");
			fetchMapProject(uuid).then((project) => {
				console.log("New project fetched:", project);
				setMapProject(project);
				setIsFirstLoad(true);
			});
		}
	}, [router.query.id]);

	useEffect(() => {
		if (mapProject && isFirstLoad) {
			setIsFirstLoad(false);
			setLoadingMessage("");

			if (!geobase.profile) {
				router.push("/404");
				return;
			}

			const channelId = `smb_map_projects:${mapProject.id}`;
			const channels = geobase.supabase
				.channel(channelId)
				.on("postgres_changes", { event: "*", schema: "public", table: "smb_map_projects" }, (payload) => {
					const newProj = payload.new as MapProject;
					setMapProject(newProj);
				})
				.subscribe();
		} else if (!isLoading.current && !mapProject) {
			router.push("/404");
		}

		if (!isFirstLoad && mapProject) {
			console.log("changed", mapProject);
			setLoadingMessage("");
		}
	}, [mapProject]);

	return (
		<MapProjectContext.Provider
			value={{
				mapProject,
				setMapProject,
			}}
		>
			<ProjectLayout>
				<MapController
					isFirstLoad={isFirstLoad}
					loadingMessage={loadingMessage}
					setLoadingMessage={setLoadingMessage}
				/>
			</ProjectLayout>
		</MapProjectContext.Provider>
	);
}
