import { MapProject, MapProjectContext, ProjectLayout } from "@/components/project-layout";
import { useSupabase } from "@/components/supabase-provider";
import { MapView } from "@/components/views/map-view";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

export default function NewMapPage() {
	const supabase = useSupabase();
	const router = useRouter();
	const [mapProject, setMapProject] = useState<MapProject | undefined>();
	const [loadingMessage, setLoadingMessage] = useState("Looking for your map project...");
	const isLoading = useRef(true);

	const fetchMapProject = async () => {
		let { data, error } = await supabase.client.from("shareable_maps_bluperint_maps").select("*");

		if (error) {
			console.error(error);
			return;
		}

		if (data && data.length > 0) {
			const foundProject = data.find((proj: MapProject) => proj.uuid === router.query.id);
			isLoading.current = false;
			return foundProject;
		} else {
			return undefined;
		}
	};

	useEffect(() => {
		if (router.query.id) {
			fetchMapProject().then((project) => {
				console.log("Project fetched:", project);
				setMapProject(project);
			});
		}
	}, [router.query.id]);

	useEffect(() => {
		if (mapProject) {
			setLoadingMessage("");
		} else if (!isLoading.current && !mapProject) {
			router.push("/404");
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
				<MapView loadingMessage={loadingMessage} setLoadingMessage={setLoadingMessage} />
			</ProjectLayout>
		</MapProjectContext.Provider>
	);
}
