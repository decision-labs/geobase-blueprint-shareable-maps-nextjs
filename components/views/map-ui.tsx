import { MaterialSymbol } from "react-material-symbols";
import { AccountMenu } from "@/components/views/account-menu";
import { Button } from "../ui/button";
import { MapLayerMouseEvent, useMap } from "react-map-gl/maplibre";
import { useContext, useEffect, useState } from "react";
import { Tool, Toolbar } from "./toolbar";
import { Sidebar } from "./sidebar";
import { AccountDetails } from "./account-details";
import { useMapProject } from "../project-layout";
import { useMapController } from "./map-controller";
import { CreateMapDialog } from "./create-map-dialog";

export function MapUI() {
	const mapController = useMapController();
	const [showSidebar, setShowSidebar] = useState(false);
	const [showAccountDetails, setShowAccountDetails] = useState(false);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [isEditingTitle, setIsEditingTitle] = useState(false);
	const [isEditingDescription, setIsEditingDescription] = useState(false);
	const { mapProject, setMapProject } = useMapProject();

	useEffect(() => {
		if (!mapProject) return;
		setTitle(mapProject.title);
		setDescription(mapProject.description);
	}, [mapProject]);

	const handleTitleClick = () => {
		setIsEditingTitle(true);
	};

	const handleDescriptionClick = () => {
		setIsEditingDescription(true);
	};

	const handleTitleBlur = () => {
		setIsEditingTitle(false);
		if (setMapProject && mapProject) setMapProject({ ...mapProject, title });
	};

	const handleDescriptionBlur = () => {
		setIsEditingDescription(false);
		if (setMapProject && mapProject) setMapProject({ ...mapProject, description });
	};

	return (
		<>
			<header className="absolute flex items-center gap-4 justify-between w-fit h-fit top-4 left-1/2 -translate-x-1/2 py-2 px-4 rounded-full bg-white/30 dark:bg-zinc-600/30 backdrop-blur-md border border-transparent dark:border-zinc-700/50 shadow-xl z-50">
				<Button
					variant={"elevated"}
					size={"icon"}
					className="!rounded-full"
					onClick={() => setShowSidebar(!showSidebar)}
				>
					<MaterialSymbol icon="menu" size={20} />
				</Button>
				{mapProject ? (
					<div className="flex flex-col items-center gap-0.5 justify-center">
						<div className="w-48">
							{isEditingTitle ? (
								<input
									type="text"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									onBlur={handleTitleBlur}
									className="text-lg font-medium px-2 tracking-tight bg-transparent w-full text-center border-none focus:outline-none focus:border-none focus:ring-2 rounded-md"
									autoFocus
									onKeyUp={(e) => {
										if (e.key === "Enter") e.currentTarget.blur();
									}}
								/>
							) : (
								<h1
									className="text-lg font-medium px-2 tracking-tight w-full text-center"
									onClick={handleTitleClick}
								>
									{title}
								</h1>
							)}
						</div>
						<div className="w-48">
							{isEditingDescription ? (
								<input
									type="text"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									onBlur={handleDescriptionBlur}
									className="text-xs leading-relaxed min-h-6 opacity-50 bg-transparent w-full text-center border-none focus:outline-none focus:border-none focus:ring-2 rounded-md"
									autoFocus
									onKeyUp={(e) => {
										if (e.key === "Enter") e.currentTarget.blur();
									}}
								/>
							) : (
								<p
									className="text-xs leading-relaxed min-h-6 flex items-center justify-center opacity-50 w-full text-center"
									onClick={handleDescriptionClick}
								>
									{description}
								</p>
							)}
						</div>
					</div>
				) : (
					<CreateMapDialog setShowSidebar={setShowSidebar} showSidebar={showSidebar} />
				)}
				<AccountMenu setShowAccountDetails={setShowAccountDetails} />
				{mapProject ? (
					<Button
						onClick={() => {
							if (mapController) mapController.recenter();
						}}
						variant={"secondary"}
						size="sm"
						className="absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full gap-2 opacity-50 hover:opacity-100"
					>
						<MaterialSymbol icon="filter_center_focus" size={20} />
						Recenter
					</Button>
				) : null}
			</header>
			<Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
			<Toolbar />
			<AccountDetails showAccountDetails={showAccountDetails} setShowAccountDetails={setShowAccountDetails} />
		</>
	);
}
