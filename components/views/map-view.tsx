import { neighborhoodStyles } from "@/lib/consts";
import { useTheme } from "next-themes";
import Map, {
	LngLatBoundsLike,
	PaddingOptions,
	PointLike,
	ViewState,
	ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapControls } from "./map-controls";
import { createContext, useState } from "react";
import { Sidebar } from "./sidebar";

export type MapViewState = Partial<ViewState> & {
	bounds?: LngLatBoundsLike;
	fitBoundsOptions?: {
		offset?: PointLike;
		minZoom?: number;
		maxZoom?: number;
		padding?: number | PaddingOptions;
	};
};

export const MapViewContext = createContext<{
	initialViewState?: MapViewState;
	currentViewState?: ViewState | null;
	title?: string;
	description?: string;
}>({});

export function MapView() {
	const [showSidebar, setShowSidebar] = useState(false);
	const theme = useTheme();
	const [currentViewState, setCurrentViewState] = useState<ViewState | null>(null);

	const initialViewState: MapViewState = {
		latitude: 52.52,
		longitude: 13.405,
		zoom: 12,
		bearing: 0,
		pitch: 0,
	};

	const mapMove = (event: ViewStateChangeEvent) => {
		setCurrentViewState(event.viewState);
	};

	return (
		<div className="relative flex w-full h-full">
			<Map
				mapStyle={theme.resolvedTheme === "dark" ? neighborhoodStyles.dark : neighborhoodStyles.light}
				initialViewState={initialViewState}
				onMove={mapMove}
				style={{
					position: "relative",
					height: "100vh",
					width: "100%",
				}}
			>
				<MapViewContext.Provider
					value={{
						initialViewState,
						currentViewState,
						title: "Berlin 🍺",
						description: "My go to places in Berlin",
					}}
				>
					<Sidebar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
					<MapControls showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
				</MapViewContext.Provider>
			</Map>
		</div>
	);
}
