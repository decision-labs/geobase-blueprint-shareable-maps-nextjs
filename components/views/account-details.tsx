import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { MaterialSymbol } from "react-material-symbols";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useGeobase } from "@/components/providers/geobase-provider";
import { useEffect, useState } from "react";
import { MapProject, useMapProject } from "@/components/providers/project-provider";
import { useToast } from "../ui/use-toast";

export function AccountDetails({
	showAccountDetails,
	setShowAccountDetails,
}: {
	showAccountDetails: boolean;
	setShowAccountDetails: (show: boolean) => void;
}) {
	const geobase = useGeobase();
	const { toast } = useToast();
	const [mapCount, setMapCount] = useState(0);
	const { mapProject } = useMapProject();

	const fetchMapCount = async () => {
		let { data, error } = await geobase.supabase
			.from("smb_map_projects")
			.select("id")
			.eq("published", true)
			.eq(
				"profile_id",
				mapProject && mapProject.profile
					? mapProject.profile.id
					: geobase.sessionRef.current
						? geobase.sessionRef.current.user.id
						: "",
			);

		if (error) {
			console.error("Error fetching user projects", error);
			return;
		}

		if (data) {
			let projects = data as MapProject[];
			setMapCount(projects.length);
		}
	};

	const uploadAvatar = async () => {
		const fileInput = document.createElement("input");
		fileInput.type = "file";
		fileInput.accept = "image/*";
		fileInput.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) return;

			const reader = new FileReader();
			reader.onload = async (e) => {
				const ext = file.name.split(".").pop();
				const filedata = e.target?.result;
				if (typeof filedata !== "string") return;
				const filebody = await fetch(filedata).then((res) => res.blob());
				const filename = `${geobase.profile?.id}/avatar.${ext}`;

				if (!geobase.profile) {
					toast({
						description: (
							<span className="text-red-500">Failed to upload avatar. Please try again later.</span>
						),
					});
					return;
				}

				const { data, error } = await geobase.supabase.storage.from("avatars").upload(filename, filebody, {
					cacheControl: "3600",
					upsert: true,
				});

				if (error) {
					console.error("Error uploading avatar", error);
					toast({
						description: (
							<span className="text-red-500">Failed to upload avatar. Please try again later.</span>
						),
					});
					return;
				}

				const photo_url = `${geobase.baseUrl}/storage/v1/object/public/avatars/${filename}`;

				const { data: profileData, error: profileError } = await geobase.supabase
					.from("profiles")
					.update({ photo_url })
					.eq("id", geobase.profile?.id)
					.select();

				if (profileError) {
					console.error("Error updating profile", profileError);
					toast({
						description: (
							<span className="text-red-500">Failed to upload avatar. Please try again later.</span>
						),
					});
					return;
				}

				if (geobase.setProfile) {
					geobase.setProfile(profileData?.[0]);
				}

				toast({
					description: "Avatar uploaded successfully.",
				});
			};
			reader.readAsDataURL(file);
		};
		fileInput.click();
	};

	useEffect(() => {
		if (showAccountDetails) {
			fetchMapCount();
		}
	}, [showAccountDetails]);

	return (
		<aside
			className={cn(
				"absolute flex flex-col gap-2 items-center py-8 px-4 w-72 h-fit top-4 right-4 rounded-xl bg-white/30 dark:bg-zinc-600/30 backdrop-blur-md border border-transparent dark:border-zinc-700/50 shadow-xl z-50 text-base transition duration-200 ease-in-out",
				showAccountDetails ? "translate-x-0" : "translate-x-[150%]",
			)}
		>
			<Button
				variant="elevated"
				size="icon"
				className="absolute top-2 right-2"
				onClick={() => {
					setShowAccountDetails(false);
				}}
			>
				<MaterialSymbol icon="close" size={20} />
			</Button>
			<button
				className={cn(
					"rounded-full w-fit hover:opacity-80 group relative hover:bg-white/50 dark:hover:bg-white/10 transition",
					geobase.session ? "" : "pointer-events-none",
				)}
				disabled={!geobase.session}
				onClick={uploadAvatar}
			>
				<Avatar className="h-32 w-32">
					<AvatarImage
						src={
							mapProject && mapProject.profile ? mapProject.profile.photo_url : geobase.profile?.photo_url
						}
						alt="Avatar"
						className="object-cover"
					/>
					<AvatarFallback>
						<MaterialSymbol icon="person" size={96} fill className="opacity-20" />
					</AvatarFallback>
				</Avatar>
				<MaterialSymbol
					icon="edit"
					size={36}
					className="absolute top-1/2 left-1/2 opacity-0 -translate-x-1/2 -translate-y-1/2 group-hover:opacity-100 transition"
				/>
			</button>
			<h2 className="text-lg mt-2">
				{mapProject && mapProject.profile ? mapProject.profile.nickname : geobase.profile?.nickname}
			</h2>
			<p className="text-sm opacity-60">
				{mapProject && mapProject.profile ? mapProject.profile.email : geobase.session?.user.email}
			</p>
			<p className="text-sm opacity-60">{mapCount} Maps Published</p>
		</aside>
	);
}
