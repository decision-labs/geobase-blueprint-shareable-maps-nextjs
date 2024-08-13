import { neighborhoodStyles, tools } from "@/lib/consts";
import { useTheme } from "next-themes";
import Map, {
	Layer,
	LineLayer,
	LngLatBoundsLike,
	MapLayerMouseEvent,
	PaddingOptions,
	PointLike,
	Source,
	ViewState,
	ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapControls } from "./map-controls";
import { createContext, useEffect, useRef, useState } from "react";
import { Spinner } from "../ui/spinner";
import { Tool } from "./toolbar";
import { GeoJSONFeatureCollection } from "@/lib/utils";
import { Cursor } from "../ui/cursor";
import { getMapTileURL, useSupabase } from "../supabase-provider";
import { useMapProject } from "../project-layout";
import { toast } from "../ui/use-toast";

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
	cursor?: string;
	setCursor?: (cursor: string | undefined) => void;
	selectedTool?: Tool;
	setSelectedTool?: (tool: Tool) => void;
}>({});

export function MapView({
	loadingMessage,
	setLoadingMessage,
}: {
	loadingMessage: string;
	setLoadingMessage: (message: string) => void;
}) {
	const supabase = useSupabase();
	const theme = useTheme();
	const { mapProject, setMapProject } = useMapProject();
	const [currentViewState, setCurrentViewState] = useState<ViewState | null>(null);
	const [cursor, setCursor] = useState<string | undefined>(undefined);
	const lastCursor = useRef<string | undefined>(undefined);
	const [selectedTool, setSelectedTool] = useState<Tool>("hand");
	const testMap = useRef(null);
	const [isDrawing, setIsDrawing] = useState(false);
	const [cursorIcon, setCursorIcon] = useState<string>("");
	const [activeDrawingGeoJson, setActiveDrawingGeoJson] = useState<GeoJSONFeatureCollection>({
		type: "FeatureCollection",
		features: [{ type: "Feature", geometry: { type: "LineString", coordinates: [] }, properties: {} }],
	});
	const [activeDrawingLayer, setActiveDrawingLayer] = useState<LineLayer>({
		id: "drawing",
		type: "line",
		source: "active-drawing-source",
		layout: {
			"line-cap": "round",
			"line-join": "round",
		},
		paint: {
			"line-color": "#ff0000",
			"line-width": 3,
		},
	});

	// Center of Europe
	const initialViewState: MapViewState = {
		latitude: 50.0,
		longitude: 15.0,
		zoom: 1.5,
	};

	useEffect(() => {
		const icon = tools.find((tool) => tool.tool === selectedTool)?.icon || "";
		setCursorIcon(selectedTool === "hand" ? "" : icon);
	}, [selectedTool]);

	const mapMove = (event: ViewStateChangeEvent) => {
		setCurrentViewState(event.viewState);
	};

	const mapDragStart = () => {
		lastCursor.current = cursor;
		setCursor("grab");
	};

	const mapDrag = () => {
		setCursor("grabbing");
	};

	const mapDragEnd = () => {
		setCursor(lastCursor.current);
	};

	const mapClick = async (e: MapLayerMouseEvent) => {
		if (!supabase.auth || !mapProject || !mapProject.id) {
			console.error("Either not authenticated or no project selected");
			toast({
				description: <span className="text-red-500">Failed to insert pin</span>,
			});
			return;
		}

		if (selectedTool === "pin") {
			const { data, error } = await supabase.client
				.from("smb_pins")
				.insert([
					{
						shape: `POINT(${e.lngLat.lng} ${e.lngLat.lat})`,
						meta: {},
						project_id: mapProject.id,
						profile_id: supabase.auth.user.id,
					},
				])
				.select();

			if (error) {
				console.error("Error inserting pin", error);
				toast({
					description: <span className="text-red-500">Failed to insert pin</span>,
				});
			} else {
				console.log("Inserted pin", data);
			}
		}
	};

	const mapMouseMove = (e: MapLayerMouseEvent) => {
		if (selectedTool === "draw" && isDrawing) {
			setActiveDrawingGeoJson({
				type: "FeatureCollection",
				features: [
					{
						type: "Feature",
						geometry: {
							type: "LineString",
							coordinates: [
								...(activeDrawingGeoJson.features[0].geometry.coordinates as [number, number][]),
								[e.lngLat.lng, e.lngLat.lat],
							],
						},
						properties: {},
					},
				],
			});
		}
	};

	const mapMouseUp = (e: MouseEvent) => {
		setIsDrawing(false);
		window.removeEventListener("mouseup", mapMouseUp);
	};

	const mapMouseDown = (e: MapLayerMouseEvent) => {
		if (selectedTool === "draw") {
			setIsDrawing(true);
			setActiveDrawingGeoJson({
				type: "FeatureCollection",
				features: [
					{
						type: "Feature",
						geometry: { type: "LineString", coordinates: [[e.lngLat.lng, e.lngLat.lat]] },
						properties: {},
					},
				],
			});
			window.addEventListener("mouseup", mapMouseUp);
		}
	};

	return (
		<div className="relative flex w-full h-full">
			<Map
				ref={testMap}
				attributionControl={false}
				mapStyle={theme.resolvedTheme === "dark" ? neighborhoodStyles.dark : neighborhoodStyles.light}
				initialViewState={initialViewState}
				onMouseDown={mapMouseDown}
				onMouseMove={mapMouseMove}
				onMove={mapMove}
				onClick={mapClick}
				onDragStart={mapDragStart}
				onDrag={mapDrag}
				onDragEnd={mapDragEnd}
				cursor={cursor}
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
						cursor,
						setCursor,
						selectedTool,
						setSelectedTool,
					}}
				>
					<Source id="active-drawing-source" type="geojson" data={activeDrawingGeoJson}>
						<Layer {...activeDrawingLayer} />
					</Source>
					<Source
						id="pins-source"
						type="vector"
						tiles={[
							getMapTileURL("public.smb_pins", supabase.auth ? supabase.auth.access_token : undefined),
						]}
					>
						<Layer
							id="pins-layer"
							type="circle"
							source-layer="public.smb_pins"
							paint={{ "circle-radius": 5, "circle-color": "#ff0000" }}
						/>
					</Source>
					<MapControls />
					{loadingMessage ? (
						<div className="fixed flex gap-3 items-center justify-center bg-white/50 dark:bg-zinc-800/50 top-0 left-0 w-screen h-screen z-50 text-4xl text-zinc-700 dark:text-zinc-300">
							<Spinner />
							<p>{loadingMessage}</p>
						</div>
					) : null}
				</MapViewContext.Provider>
			</Map>
			<Cursor>
				<div className="w-8 h-8 text-2xl -translate-x-1/2 -translate-y-full -mt-4">{cursorIcon}</div>
			</Cursor>
		</div>
	);
}
