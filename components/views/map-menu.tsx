import { MaterialSymbol } from "react-material-symbols";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useEffect, useRef, useState } from "react";
import { MapProject, useMapProject } from "@/components/providers/project-provider";
import { useRouter } from "next/router";
import { useGeobase } from "@/components/providers/geobase-provider";
import { useToast } from "../ui/use-toast";
import { useMapController } from "./map-controller";
import { Switch } from "../ui/switch";
import { createUUID } from "@/lib/utils";

export function MapMenu({
	project,
	className = "",
	setShouldRefresh,
}: {
	project: MapProject;
	className?: string;
	setShouldRefresh: (val: boolean) => void;
}) {
	const [dialogIntention, setDialogIntention] = useState<"share" | "delete">("share");
	const { mapProject: activeProject } = useMapProject();
	const mapController = useMapController();
	const router = useRouter();
	const geobase = useGeobase();
	const { toast } = useToast();
	const [isMapPublic, setIsMapPublic] = useState(false);
	const initialPublicStateLoaded = useRef(false);

	useEffect(() => {
		if (!initialPublicStateLoaded.current) {
			setIsMapPublic(project.published);
			initialPublicStateLoaded.current = true;
		}
	}, [project]);

	const createCopy = async () => {
		if (!geobase.sessionRef.current) {
			console.error("No session available");
			toast({
				description: <span className="text-red-500">Failed to create new map. Please sign in first.</span>,
			});
			return;
		}

		const newProject: MapProject = {
			uuid: createUUID(),
			title: `Copy of ${project.title}`,
			description: project.description,
			bounds: project.bounds,
			profile_id: geobase.sessionRef.current.user.id,
			published: false,
		};

		const { data, error } = await geobase.supabase.from("smb_map_projects").upsert([newProject]).select();

		if (error) {
			console.error("Error inserting map project copy", error);
			toast({
				description: <span className="text-red-500">Failed to create map copy. Please try again later.</span>,
			});
			return;
		}

		if (data) {
			const createdProject = data[0] as MapProject;

			// Copy associated layers
			const layerTables = ["smb_drawings", "smb_pins", "smb_annotations", "smb_attachments"];

			for (const table of layerTables) {
				const { data: layerData, error: layerError } = await geobase.supabase
					.from(table)
					.select("*")
					.eq("project_id", project.id);

				if (layerError) {
					console.error(`Error fetching ${table}`, layerError);
					continue;
				}

				if (layerData && layerData.length > 0) {
					const newLayerData = layerData.map((item) => {
						const newItem = {
							...item,
							project_id: createdProject.id,
							profile_id: geobase.sessionRef.current!.user.id,
							created_at: new Date().toISOString(),
							updated_at: new Date().toISOString(),
						};
						delete newItem.id;
						return newItem;
					});

					const { error: insertError } = await geobase.supabase.from(table).insert(newLayerData);

					if (insertError) {
						console.error(`Error inserting copied ${table}`, insertError);
					}
				}
			}

			router.push(`/maps/${createdProject.uuid}`);
			if (setShouldRefresh) setShouldRefresh(true);
		}
	};

	const handleSwitchChange = async () => {
		const isPublished = !isMapPublic;
		setIsMapPublic(isPublished);
		const { data, error } = await geobase.supabase
			.from("smb_map_projects")
			.update({ published: isPublished })
			.eq("id", project.id);

		if (error) {
			console.error("Error updating the map", error);
			toast({
				description: (
					<span className="text-red-500">Failed to {isPublished ? "publish" : "unpublish"} the map</span>
				),
			});
			return;
		}

		toast({
			description: `Map ${isPublished ? "published" : "unpublished"}`,
		});
	};

	const handleLinkCopy = () => {
		toast({
			description: "Link copied",
		});
		navigator.clipboard.writeText(window.location.href);
	};

	const handleDelete = async () => {
		if (!mapController) return;
		if (activeProject?.id === project.id) {
			mapController.setLoadingMessage("Deleting the map...");

			const { error } = await geobase.supabase.from("smb_map_projects").delete().eq("id", project.id);

			if (error) {
				console.error("Error deleting the map", error);
				toast({
					description: <span className="text-red-500">Failed to delete the map</span>,
				});
				return;
			}

			toast({
				description: "Map deleted",
			});

			setShouldRefresh(true);

			mapController.setLoadingMessage("");

			router.push("/");
		} else {
			const { error } = await geobase.supabase.from("smb_map_projects").delete().eq("id", project.id);

			if (error) {
				console.error("Error deleting the map", error);
				toast({
					description: <span className="text-red-500">Failed to delete the map</span>,
				});
				return;
			}

			toast({
				description: "Map deleted",
			});

			setShouldRefresh(true);
		}
	};

	return (
		<>
			<Dialog>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant={"elevated"} size={"icon"} className={className}>
							<MaterialSymbol icon="more_horiz" size={20} />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-56" align="start" side="right" sideOffset={20} alignOffset={-13}>
						{geobase.session ? (
							<DialogTrigger asChild>
								<DropdownMenuItem
									className="gap-2 items-center"
									onMouseOver={() => setDialogIntention("share")}
									onFocus={() => setDialogIntention("share")}
								>
									<MaterialSymbol icon="share" size={16} className="" />
									Share link
								</DropdownMenuItem>
							</DialogTrigger>
						) : null}
						<DropdownMenuItem className="gap-2 items-center" onClick={createCopy}>
							<MaterialSymbol icon="file_copy" size={16} className="" />
							Create a copy
						</DropdownMenuItem>
						{geobase.session ? (
							<>
								<DropdownMenuSeparator />
								<DialogTrigger asChild>
									<DropdownMenuItem
										className="gap-2 items-center text-red-500 hover:!text-red-500"
										onMouseOver={() => setDialogIntention("delete")}
										onFocus={() => setDialogIntention("delete")}
									>
										<MaterialSymbol icon="delete" size={16} className="" />
										Delete map
									</DropdownMenuItem>
								</DialogTrigger>
							</>
						) : null}
					</DropdownMenuContent>
				</DropdownMenu>
				<DialogContent className="sm:max-w-md">
					{dialogIntention === "delete" ? (
						<>
							<DialogHeader>
								<DialogTitle>
									This permanently deletes <span className="text-red-500">{project.title}</span>
								</DialogTitle>
								<DialogDescription>You will not be able to recover it once deleted.</DialogDescription>
							</DialogHeader>
							<div className="flex items-center gap-2">
								<DialogClose asChild>
									<Button variant="secondary">Cancel</Button>
								</DialogClose>
								<DialogClose asChild>
									<Button onClick={handleDelete} variant="destructive">
										Delete
									</Button>
								</DialogClose>
							</div>
						</>
					) : (
						<>
							<DialogHeader>
								<DialogTitle>Share &quot;{project.title}&quot;</DialogTitle>
								<DialogDescription>
									Map is currently {isMapPublic ? "public" : "private"}.
								</DialogDescription>
							</DialogHeader>
							<div className="flex items-center space-x-2">
								<div className="grid flex-1 gap-2">
									<Label htmlFor="link" className="sr-only">
										Link
									</Label>
									<Input id="link" defaultValue={window.location.href} readOnly />
								</div>
								<Button onClick={handleLinkCopy} size="sm" className="px-3">
									<span className="sr-only">Copy</span>
									<MaterialSymbol icon="content_copy" size={20} />
								</Button>
							</div>
							<DialogFooter className="sm:justify-between">
								<DialogClose asChild>
									<Button type="button" variant="secondary">
										Close
									</Button>
								</DialogClose>
								<div className="flex items-center space-x-2">
									<Switch
										id="is-published"
										checked={isMapPublic}
										onCheckedChange={handleSwitchChange}
									/>
									<Label htmlFor="is-published">
										{isMapPublic ? "Map is public" : "Map is private"}
									</Label>
								</div>
							</DialogFooter>
						</>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}
