import { MapProject, MapProjectContext, ProjectLayout } from "@/components/project-layout";
import { useSupabase } from "@/components/supabase-provider";
import { MapController } from "@/components/views/map-controller";
import { createUUID } from "@/lib/utils";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function HomePage() {
	const supabase = useSupabase();
	const router = useRouter();
	const [mapProject, setMapProject] = useState<MapProject | undefined>();
	const [loadingMessage, setLoadingMessage] = useState("");

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
