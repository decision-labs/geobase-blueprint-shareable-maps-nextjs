import { neighborhoodStyles, tools } from "@/lib/consts";
import { useTheme } from "next-themes";
import Map, {
	Layer,
	LineLayer,
	LngLatBoundsLike,
	MapLayerMouseEvent,
	MapRef,
	PaddingOptions,
	PointLike,
	Source,
	ViewState,
	ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapUI } from "./map-ui";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Spinner } from "../ui/spinner";
import { Tool } from "./toolbar";
import { GeoJSONFeatureCollection } from "@/lib/utils";
import { Cursor } from "../ui/cursor";
import { getMapTileURL, useSupabase } from "../supabase-provider";
import { useMapProject } from "../project-layout";
import { useToast } from "../ui/use-toast";
import { RequestTransformFunction } from "maplibre-gl";

export type MapViewState = Partial<ViewState> & {
	bounds?: LngLatBoundsLike;
	fitBoundsOptions?: {
		offset?: PointLike;
		minZoom?: number;
		maxZoom?: number;
		padding?: number | PaddingOptions;
	};
};

export const MapControllerContext = createContext<{
	initialViewState: MapViewState;
	currentViewState: ViewState | null;
	loadingMessage: string;
	setLoadingMessage: (message: string) => void;
	cursor: string | undefined;
	setCursor: (cursor: string | undefined) => void;
	selectedTool: Tool;
	setSelectedTool: (tool: Tool) => void;
	recenter: () => void;
} | null>(null);

export function useMapController() {
	const context = useContext(MapControllerContext);
	if (context === undefined) {
		throw new Error("useMapController must be used within a MapController");
	}
	return context;
}

export type TileSourceConfig = {
	id: string;
	tiles: string[];
	params: Record<string, string>;
};

export function MapController({
	loadingMessage,
	setLoadingMessage,
}: {
	loadingMessage: string;
	setLoadingMessage: (message: string) => void;
}) {
	const { toast } = useToast();
	const supabase = useSupabase();
	const theme = useTheme();
	const mapRef = useRef<MapRef | null>(null);
	const { mapProject, setMapProject } = useMapProject();
	const [currentViewState, setCurrentViewState] = useState<ViewState | null>(null);
	const [cursor, setCursor] = useState<string | undefined>(undefined);
	const lastCursor = useRef<string | undefined>(undefined);
	const [selectedTool, setSelectedTool] = useState<Tool>("hand");
	const [isDrawing, setIsDrawing] = useState(false);
	const [cursorIcon, setCursorIcon] = useState<string>("");
	const drawingCoordArray = useRef<number[][]>([]);
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

	const pinsSourceConfig: TileSourceConfig = {
		id: "public.smb_pins",
		tiles: [
			getMapTileURL("public.smb_pins", {
				filter: `project_id=${mapProject ? mapProject.id : -1}`,
			}),
		],
		params: {
			filter: `project_id=${mapProject ? mapProject.id : -1}`,
		},
	};

	const drawingsSourceConfig: TileSourceConfig = {
		id: "public.smb_drawings",
		tiles: [
			getMapTileURL("public.smb_drawings", {
				filter: `project_id=${mapProject ? mapProject.id : -1}`,
			}),
		],
		params: {
			filter: `project_id=${mapProject ? mapProject.id : -1}`,
		},
	};

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

	useEffect(() => {
		updateTiles(pinsSourceConfig);
		updateTiles(drawingsSourceConfig);
	}, [mapProject]);

	useEffect(() => {
		if (!mapRef.current) return;

		if (selectedTool === "hand") {
			setCursor(undefined);
			mapRef.current.getMap().dragPan.enable();
		} else if (selectedTool === "draw") {
			setCursor("crosshair");
			mapRef.current.getMap().dragPan.disable();
		} else if (selectedTool === "pin") {
			setCursor("crosshair");
			mapRef.current.getMap().dragPan.enable();
		} else if (selectedTool === "sign") {
			setCursor("crosshair");
			mapRef.current.getMap().dragPan.enable();
		} else if (selectedTool === "attachment") {
			setCursor("crosshair");
			mapRef.current.getMap().dragPan.enable();
		}
	}, [selectedTool]);

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

		if (e.key === "Escape") setSelectedTool("hand");
		if (e.key === " ") recenter();
		if (e.key === "1") setSelectedTool("hand");
		if (e.key === "2") setSelectedTool("draw");
		if (e.key === "3") setSelectedTool("pin");
		if (e.key === "4") setSelectedTool("sign");
		if (e.key === "5") setSelectedTool("attachment");
	};

	useEffect(() => {
		window.addEventListener("keydown", handleKeydown);
		return () => {
			window.removeEventListener("keydown", handleKeydown);
		};
	}, []);

	useEffect(() => {
		drawingCoordArray.current = activeDrawingGeoJson.features[0].geometry.coordinates as [number, number][];
	}, [activeDrawingGeoJson]);

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
			const { data, error } = await supabase.client.from("smb_pins").insert([
				{
					shape: `POINT(${e.lngLat.lng} ${e.lngLat.lat})`,
					meta: {},
					project_id: mapProject.id,
					profile_id: supabase.auth.user.id,
				},
			]);

			if (error) {
				console.error("Error inserting pin", error);
				toast({
					description: <span className="text-red-500">Failed to insert pin</span>,
				});
			} else {
				updateTiles(pinsSourceConfig);
			}
		}
	};

	const updateTiles = (sourceConfig: TileSourceConfig) => {
		if (!mapRef.current) return;

		const mapClient = mapRef.current.getMap();
		const source = mapClient.getSource(sourceConfig.id);
		if (source) {
			// @ts-ignore
			source.setTiles([getMapTileURL(sourceConfig.id, sourceConfig.params)]);
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

	const mapMouseUp = async (e: MouseEvent) => {
		setIsDrawing(false);
		setActiveDrawingGeoJson({
			type: "FeatureCollection",
			features: [
				{
					type: "Feature",
					geometry: {
						type: "LineString",
						coordinates: [],
					},
					properties: {},
				},
			],
		});
		window.removeEventListener("mouseup", mapMouseUp);

		if (!mapProject || !supabase.session.current) return;
		const { data, error } = await supabase.client.from("smb_drawings").insert([
			{
				shape: `LINESTRING(${drawingCoordArray.current.map((coord) => coord.join(" ")).join(",")})`,
				meta: {},
				project_id: mapProject.id,
				profile_id: supabase.session.current.user.id,
			},
		]);

		if (error) {
			console.error("Error inserting drawing", error);
			toast({
				description: <span className="text-red-500">Failed to send drawing</span>,
			});
		} else {
			updateTiles(drawingsSourceConfig);
		}
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

	const transformRequest: RequestTransformFunction = (url, resourceType) => {
		if (
			resourceType === "Tile" &&
			url.startsWith(supabase.baseUrl) &&
			supabase.session &&
			supabase.session.current
		) {
			return {
				url,
				headers: {
					Authorization: `Bearer ${supabase.session.current.access_token}`,
				},
			};
		}
	};

	const recenter = () => {
		if (!mapRef.current) return;
		if (!initialViewState.latitude || !initialViewState.longitude) return;

		mapRef.current.flyTo({
			center: {
				lat: initialViewState.latitude,
				lng: initialViewState.longitude,
			},
			zoom: initialViewState.zoom,
			duration: 1000,
		});
	};

	return (
		<div className="relative flex w-full h-full">
			<Map
				ref={mapRef}
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
				transformRequest={transformRequest}
				style={{
					position: "relative",
					height: "100vh",
					width: "100vw",
				}}
			>
				<MapControllerContext.Provider
					value={{
						initialViewState,
						currentViewState,
						loadingMessage,
						setLoadingMessage,
						cursor,
						setCursor,
						selectedTool,
						setSelectedTool,
						recenter,
					}}
				>
					<Source id="active-drawing-source" type="geojson" data={activeDrawingGeoJson}>
						<Layer {...activeDrawingLayer} />
					</Source>
					<Source type="vector" {...drawingsSourceConfig}>
						<Layer
							id="drawings-layer"
							type="line"
							source-layer={drawingsSourceConfig.id}
							layout={{
								"line-cap": "round",
								"line-join": "round",
							}}
							paint={{
								"line-color": "#ff0000",
								"line-width": 3,
							}}
						/>
					</Source>
					<Source type="vector" {...pinsSourceConfig}>
						<Layer
							id="pins-layer"
							type="circle"
							source-layer={pinsSourceConfig.id}
							paint={{ "circle-radius": 5, "circle-color": "#ff000050" }}
						/>
					</Source>
					<MapUI />
					{loadingMessage ? (
						<div className="fixed flex gap-3 items-center justify-center bg-white/50 dark:bg-zinc-800/50 top-0 left-0 w-screen h-screen z-50 text-4xl text-zinc-700 dark:text-zinc-300">
							<Spinner />
							<p>{loadingMessage}</p>
						</div>
					) : null}
				</MapControllerContext.Provider>
			</Map>
			<Cursor>
				<div className="w-8 h-8 text-2xl -translate-x-1/2 -translate-y-full -mt-4">{cursorIcon}</div>
			</Cursor>
		</div>
	);
}
