import { MapProject, MapProjectContext, ProjectLayout } from "@/components/project-layout";
import { MapView } from "@/components/views/map-view";
import { createUUID } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function NewMapPage() {
	const [mapProject, setMapProject] = useState<MapProject | undefined>({
		id: -1,
		uuid: createUUID(),
		title: "New map 🗺",
		description: "an untitled map by user",
		bounds: {
			north: 0,
			east: 0,
			south: 0,
			west: 0,
		},
		created_by: "user-id",
		created_at: new Date().toISOString(),
		is_draft: true,
	});
	const [loadingMessage, setLoadingMessage] = useState("Praparing new map...");
	useEffect(() => {
		// @TODO: Map needs to be created on server to backup
		setLoadingMessage("");
	}, []);

	useEffect(() => {
		console.log("mapProject", mapProject);
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
