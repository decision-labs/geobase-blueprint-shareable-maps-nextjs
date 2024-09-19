import { MapProject, MapProjectContext, ProjectLayout } from "@/components/providers/project-provider";
import { Profile, useGeobase } from "@/components/providers/geobase-provider";
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

	const fetchProfileData = async (profileId: string) => {
		let { data, error } = await geobase.supabase.from("profiles").select("*").eq("id", profileId);

		if (error) {
			console.error(error);
			return;
		}

		if (data && data.length > 0) {
			return data[0] as Profile;
		} else {
			return undefined;
		}
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
			console.log(data[0]);
			const project = data[0] as MapProject;

			const profile = await fetchProfileData(project.profile_id);
			if (profile) {
				project.profile = profile;
			} else {
				console.error("Profile not found for project:", project.profile_id);
			}

			return project;
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
				if (!project) {
					router.push("/404");
				}
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

			const channelId = `smb_map_projects:${mapProject.id}`;
			const channels = geobase.supabase
				.channel(channelId)
				.on("postgres_changes", { event: "*", schema: "public", table: "smb_map_projects" }, (payload) => {
					// const profile = mapProject.profile;
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
