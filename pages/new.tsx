import { MapProject, MapProjectContext, ProjectLayout } from "@/components/project-layout";
import { useSupabase } from "@/components/supabase-provider";
import { MapController } from "@/components/views/map-controller";
import { createUUID } from "@/lib/utils";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function NewMapPage() {
	const supabase = useSupabase();
	const router = useRouter();
	const [mapProject, setMapProject] = useState<MapProject | undefined>();
	const [loadingMessage, setLoadingMessage] = useState("Praparing new map...");

	async function pushNewMapToGeobase(project: MapProject) {
		const { data, error } = await supabase.client.from("smb_map_projects").upsert([project]).select();

		if (error) {
			console.error("Error inserting new map project", error);
			return;
		}

		if (data) {
			const createdProject = data[0] as MapProject;
			setMapProject(createdProject);
			router.push(`/maps/${createdProject.uuid}`);
		}
	}

	useEffect(() => {
		if (!supabase.auth) return;
		if (mapProject) return;

		const newProject: MapProject = {
			uuid: createUUID(),
			title: "New map 🗺",
			description: "an untitled map by user",
			bounds: {
				north: 0,
				east: 0,
				south: 0,
				west: 0,
			},
			profile_id: supabase.auth?.user.id,
			published: false,
		};

		pushNewMapToGeobase(newProject);
	}, [supabase.auth]);

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
