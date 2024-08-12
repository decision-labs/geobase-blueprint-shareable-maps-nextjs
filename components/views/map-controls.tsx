import { MaterialSymbol } from "react-material-symbols";
import { AccountMenu } from "../menus/account";
import { Button } from "../ui/button";
import { useMap } from "react-map-gl/maplibre";
import { useContext, useEffect, useState } from "react";
import { MapViewContext } from "./map-view";

export function MapControls({
	showSidebar,
	setShowSidebar,
}: {
	showSidebar: boolean;
	setShowSidebar: (show: boolean) => void;
}) {
	const { current: map } = useMap();
	const mapView = useContext(MapViewContext);
	const [showRecenter, setShowRecenter] = useState(false);

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

		console.log(mapView.currentViewState, mapView.initialViewState);
	}, [mapView.currentViewState]);

	return (
		<>
			<header className="absolute flex items-center gap-4 justify-between w-72 h-fit top-4 left-1/2 -translate-x-1/2 py-2 px-4 rounded-full bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md border border-transparent dark:border-zinc-800 shadow-xl z-50">
				<button
					className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-900"
					onClick={() => setShowSidebar(!showSidebar)}
				>
					<MaterialSymbol icon="menu" size={20} />
				</button>
				<div className="flex flex-col items-center gap-0.5 justify-center">
					<h1 className={`text-lg font-medium px-2 tracking-tight`}>{mapView.title}</h1>
					<p className="text-xs opacity-50">{mapView.description}</p>
				</div>
				<AccountMenu />
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
			<div className="absolute flex items-center gap-4 justify-between w-1/2 h-12 bottom-0 left-1/2 -translate-x-1/2 py-2 px-4 rounded-t-3xl bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md border border-transparent dark:border-zinc-800 shadow-xl z-50">
				Toolbar
			</div>
		</>
	);
}
