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
import { Spinner } from "../ui/spinner";

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
	loadingMessage?: string;
	setLoadingMessage?: (message: string) => void;
}>({});

export function MapView({
	loadingMessage,
	setLoadingMessage,
}: {
	loadingMessage: string;
	setLoadingMessage: (message: string) => void;
}) {
	const theme = useTheme();
	const [currentViewState, setCurrentViewState] = useState<ViewState | null>(null);

	// Center of Europe
	const initialViewState: MapViewState = {
		latitude: 50.0,
		longitude: 15.0,
		zoom: 1.5,
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
						loadingMessage,
						setLoadingMessage,
					}}
				>
					<MapControls />
					{loadingMessage ? (
						<div className="fixed flex gap-3 items-center justify-center bg-white/50 dark:bg-zinc-800/50 top-0 left-0 w-screen h-screen z-50 text-4xl text-zinc-700 dark:text-zinc-300">
							<Spinner />
							<p>{loadingMessage}</p>
						</div>
					) : null}
				</MapViewContext.Provider>
			</Map>
		</div>
	);
}
