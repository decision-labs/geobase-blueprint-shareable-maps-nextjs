import { MaterialSymbol } from "react-material-symbols";
import { Button } from "../ui/button";
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
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useGeobase } from "@/components/providers/geobase-provider";
import { MapProject } from "@/components/providers/project-provider";
import { createUUID } from "@/lib/utils";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export function CreateMapDialog({
	variant = "default",
	setShowSidebar,
	showSidebar,
	setShouldRefresh,
}: {
	variant?: "default" | "icon";
	setShowSidebar: (show: boolean) => void;
	setShouldRefresh?: (refresh: boolean) => void;
	showSidebar: boolean;
}) {
	const geobase = useGeobase();
	const { toast } = useToast();
	const router = useRouter();
	const [title, setTitle] = useState("New map 🗺");

	useEffect(() => {
		if (showSidebar) {
			setTitle("New map 🗺");
		}
	}, [showSidebar]);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();

		if (!geobase.sessionRef.current) {
			console.error("No session available");
			toast({
				description: <span className="text-red-500">Failed to create new map. Please sign in first.</span>,
			});
			return;
		}

		const newProject: MapProject = {
			uuid: createUUID(),
			title,
			description: "Map description goes here",
			bounds: null,
			profile_id: geobase.sessionRef.current.user.id,
			published: false,
		};

		const { data, error } = await geobase.supabase.from("smb_map_projects").upsert([newProject]).select();

		if (error) {
			console.error("Error inserting new map project", error);
			toast({
				description: <span className="text-red-500">Failed to create new map. Please try again later.</span>,
			});
			return;
		}

		if (data) {
			const createdProject = data[0] as MapProject;
			router.push(`/maps/${createdProject.uuid}`);
			if (setShouldRefresh) setShouldRefresh(true);
		}
	}

	return (
		<Dialog>
			<DialogTrigger asChild>
				{variant === "icon" ? (
					<Button variant={"elevated"} size="icon">
						<MaterialSymbol icon="add" size={20} />
					</Button>
				) : (
					<Button variant={"secondary"}>Create new map</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create a new map</DialogTitle>
					<DialogDescription>What&apos;s the name of your new map?</DialogDescription>
				</DialogHeader>
				<form className="flex items-center space-x-2" onSubmit={handleSubmit}>
					<div className="grid flex-1 gap-2">
						<Label htmlFor="new-project-name" className="sr-only">
							Name
						</Label>
						<Input
							id="new-project-name"
							type="text"
							name="title"
							value={title}
							onChange={(e) => setTitle(e.currentTarget.value)}
						/>
					</div>
					<DialogClose asChild>
						<Button type="submit" variant={"secondary"}>
							<MaterialSymbol icon="add" size={20} />
							Create
						</Button>
					</DialogClose>
				</form>
			</DialogContent>
		</Dialog>
	);
}
