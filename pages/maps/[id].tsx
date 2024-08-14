import { MapProject, MapProjectContext, ProjectLayout } from "@/components/project-layout";
import { useSupabase } from "@/components/supabase-provider";
import { toast } from "@/components/ui/use-toast";
import { MapController } from "@/components/views/map-controller";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

export default function MapPage() {
	const supabase = useSupabase();
	const router = useRouter();
	const [mapProject, setMapProject] = useState<MapProject | undefined>();
	const [loadingMessage, setLoadingMessage] = useState("Looking for your map project...");
	const [isFirstLoad, setIsFirstLoad] = useState(true);
	const isLoading = useRef(true);

	const updateMapProject = async (project: MapProject) => {
		let { data, error } = await supabase.client.from("smb_map_projects").update(project).eq("uuid", project.uuid);

		if (error) {
			console.error(error);
			toast({
				description: <span className="text-red-500">Failed to update project.</span>,
			});
			return;
		}

		console.log("Project updated:", data);
	};

	const fetchMapProject = async () => {
		let { data, error } = await supabase.client.from("smb_map_projects").select("*").eq("uuid", router.query.id);

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
		if (router.query.id && !mapProject) {
			fetchMapProject().then((project) => {
				console.log("Project fetched:", project);
				setMapProject(project);
			});
		}
	}, [router.query.id]);

	useEffect(() => {
		if (mapProject && isFirstLoad) {
			setIsFirstLoad(false);
			setLoadingMessage("");
		} else if (!isLoading.current && !mapProject) {
			router.push("/404");
		}

		if (!isFirstLoad && mapProject) {
			console.log("changed", mapProject);
			updateMapProject(mapProject);
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
				<MapController loadingMessage={loadingMessage} setLoadingMessage={setLoadingMessage} />
			</ProjectLayout>
		</MapProjectContext.Provider>
	);
}
