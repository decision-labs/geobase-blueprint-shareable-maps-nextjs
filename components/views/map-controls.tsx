import { MaterialSymbol } from "react-material-symbols";
import { AccountMenu } from "@/components/views/account-menu";
import { Button } from "../ui/button";
import { MapLayerMouseEvent, useMap } from "react-map-gl/maplibre";
import { useContext, useEffect, useState } from "react";
import { MapViewContext } from "./map-view";
import { Tool, Toolbar } from "./toolbar";
import { Sidebar } from "./sidebar";
import { AccountDetails } from "./account-details";
import { useMapProject } from "../project-layout";

export function MapControls() {
	const mapController = useMap();
	const mapView = useContext(MapViewContext);
	const [showRecenter, setShowRecenter] = useState(false);
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

	const recenter = () => {
		if (!mapView.initialViewState) return;
		if (!mapView.initialViewState.latitude) return;
		if (!mapView.initialViewState.longitude) return;

		mapController.current?.flyTo({
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

	const handleKeydown = (e: KeyboardEvent) => {
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

		if (!mapView || !mapView.setSelectedTool) return;

		if (e.key === "Escape") mapView.setSelectedTool("hand");
		if (e.key === " ") recenter();
		if (e.key === "1") mapView.setSelectedTool("hand");
		if (e.key === "2") mapView.setSelectedTool("draw");
		if (e.key === "3") mapView.setSelectedTool("pin");
		if (e.key === "4") mapView.setSelectedTool("sign");
		if (e.key === "5") mapView.setSelectedTool("attachment");
	};

	useEffect(() => {
		window.addEventListener("keydown", handleKeydown);
		return () => {
			window.removeEventListener("keydown", handleKeydown);
		};
	}, []);

	useEffect(() => {
		if (!mapView) return;
		if (!mapView.setCursor) return;
		if (!mapView || !mapView.selectedTool) return;
		if (!mapController.current) return;

		if (mapView.selectedTool === "hand") {
			mapView.setCursor(undefined);
			mapController.current.getMap().dragPan.enable();
		} else if (mapView.selectedTool === "draw") {
			mapView.setCursor("crosshair");
			mapController.current.getMap().dragPan.disable();
		} else if (mapView.selectedTool === "pin") {
			mapView.setCursor("crosshair");
			mapController.current.getMap().dragPan.enable();
		} else if (mapView.selectedTool === "sign") {
			mapView.setCursor("crosshair");
			mapController.current.getMap().dragPan.enable();
		} else if (mapView.selectedTool === "attachment") {
			mapView.setCursor("crosshair");
			mapController.current.getMap().dragPan.enable();
		}
	}, [mapView.selectedTool]);

	return (
		<>
			<header className="absolute flex items-center gap-4 justify-between w-fit h-fit top-4 left-1/2 -translate-x-1/2 py-2 px-4 rounded-full bg-white/30 dark:bg-zinc-600/30 backdrop-blur-md border border-transparent dark:border-zinc-700/50 shadow-xl z-50">
				<Button
					variant={"ghost"}
					size={"icon"}
					className="!rounded-full hover:!shadow-md border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-700"
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
			<Toolbar />
			<AccountDetails showAccountDetails={showAccountDetails} setShowAccountDetails={setShowAccountDetails} />
		</>
	);
}
