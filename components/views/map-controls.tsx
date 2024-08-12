import { MaterialSymbol } from "react-material-symbols";
import { AccountMenu } from "@/components/views/account-menu";
import { Button } from "../ui/button";
import { useMap } from "react-map-gl/maplibre";
import { useContext, useEffect, useState } from "react";
import { MapViewContext } from "./map-view";
import { Tool, Toolbar } from "./toolbar";
import { Sidebar } from "./sidebar";
import { AccountDetails } from "./account-details";
import { useMapProject } from "../project-layout";

export function MapControls() {
	const { current: map } = useMap();
	const mapView = useContext(MapViewContext);
	const [showRecenter, setShowRecenter] = useState(false);
	const [showSidebar, setShowSidebar] = useState(false);
	const [showAccountDetails, setShowAccountDetails] = useState(false);
	const [selectedTool, setSelectedTool] = useState<Tool>("hand");
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

	const recenter = () => {
		if (!mapView.initialViewState) return;
		if (!mapView.initialViewState.latitude) return;
		if (!mapView.initialViewState.longitude) return;

		map?.flyTo({
			center: {
				lat: mapView.initialViewState.latitude,
				lng: mapView.initialViewState.longitude,
			},
			zoom: mapView.initialViewState.zoom,
			duration: 1000,
		});
	};

	useEffect(() => {
		if (!mapView.currentViewState || !mapView.initialViewState) return;
		if (!mapView.initialViewState.latitude || !mapView.initialViewState.longitude) return;

		const isCloseEnough = (a: number, b: number, tolerance = 0.00001) => Math.abs(a - b) < tolerance;

		const isViewStateCloseEnough =
			isCloseEnough(mapView.currentViewState.latitude, mapView.initialViewState.latitude) &&
			isCloseEnough(mapView.currentViewState.longitude, mapView.initialViewState.longitude) &&
			mapView.currentViewState.zoom === mapView.initialViewState.zoom;

		setShowRecenter(!isViewStateCloseEnough);
	}, [mapView.currentViewState]);

	useEffect(() => {
		window.addEventListener("keydown", (e) => {
			const activeElement = document.activeElement as HTMLElement | null;
			if (activeElement) {
				const isInputFocused = activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA";
				const isEditableFocused = activeElement.hasAttribute("contenteditable");

				if (isInputFocused || isEditableFocused) {
					if (e.key === "Escape") {
						activeElement.blur();
						e.preventDefault();
					}
					return;
				}
			}

			if (e.key === "Escape") setSelectedTool("hand");
			if (e.key === " ") recenter();
			if (e.key === "1") setSelectedTool("hand");
			if (e.key === "2") setSelectedTool("draw");
			if (e.key === "3") setSelectedTool("pin");
			if (e.key === "4") setSelectedTool("sign");
			if (e.key === "5") setSelectedTool("attachment");
		});
	}, []);

	return (
		<>
			<header className="absolute flex items-center gap-4 justify-between w-fit h-fit top-4 left-1/2 -translate-x-1/2 py-2 px-4 rounded-full bg-white/30 dark:bg-zinc-600/30 backdrop-blur-md border border-transparent dark:border-zinc-800 shadow-xl z-50">
				<Button
					variant={"ghost"}
					size={"icon"}
					className="!rounded-full"
					onClick={() => setShowSidebar(!showSidebar)}
				>
					<MaterialSymbol icon="menu" size={20} />
				</Button>
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
				<AccountMenu setShowAccountDetails={setShowAccountDetails} />
				{showRecenter ? (
					<Button
						onClick={recenter}
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
			<Toolbar selectedTool={selectedTool} setSelectedTool={setSelectedTool} />
			<AccountDetails showAccountDetails={showAccountDetails} setShowAccountDetails={setShowAccountDetails} />
		</>
	);
}
