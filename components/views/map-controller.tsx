import { neighborhoodStyles, tools } from "@/lib/consts";
import { useTheme } from "next-themes";
import Map, {
	Layer,
	LayerProps,
	LineLayer,
	LngLatBoundsLike,
	MapLayerMouseEvent,
	MapRef,
	Marker,
	PaddingOptions,
	PointLike,
	Source,
	ViewState,
	ViewStateChangeEvent,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapUI } from "./map-ui";
import { createContext, KeyboardEvent as ReactKeyboardEvent, useContext, useEffect, useRef, useState } from "react";
import { Spinner } from "../ui/spinner";
import { Tool } from "./toolbar";
import { cn, GeoJSONFeatureCollection } from "@/lib/utils";
import { Cursor } from "../ui/cursor";
import { getMapTileURL, useGeobase } from "@/components/providers/geobase-provider";
import { useMapProject } from "@/components/providers/project-provider";
import { useToast } from "../ui/use-toast";
import { LineLayerSpecification, LngLat, LngLatBounds, MapLibreEvent, RequestTransformFunction } from "maplibre-gl";
import { Input } from "../ui/input";

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
	isFirstLoad = false,
	loadingMessage,
	setLoadingMessage,
}: {
	isFirstLoad?: boolean;
	loadingMessage: string;
	setLoadingMessage: (message: string) => void;
}) {
	const { toast } = useToast();
	const geobase = useGeobase();
	const theme = useTheme();
	const mapRef = useRef<MapRef | null>(null);
	const { mapProject, setMapProject } = useMapProject();
	const [currentViewState, setCurrentViewState] = useState<ViewState | null>(null);
	const [isMouseDown, setIsMouseDown] = useState(false);
	const [cursor, setCursor] = useState<string | undefined>(undefined);
	const lastCursor = useRef<string | undefined>(undefined);
	const [selectedTool, setSelectedTool] = useState<Tool>("hand");
	const [isDrawing, setIsDrawing] = useState(false);
	const [isErasing, setIsErasing] = useState(false);
	const [featuresToErase, setFeaturesToErase] = useState<string[]>([]);
	const featuresToEraseRef = useRef<string[]>([]);
	const [annotationText, setAnnotationText] = useState("");
	const [annotationPosition, setAnnotationPosition] = useState<LngLat>(new LngLat(0, 0));
	const annotationInputRef = useRef<HTMLInputElement | null>(null);
	const [isAnnotationEditing, setIsAnnotationEditing] = useState(false);
	const [cursorIcon, setCursorIcon] = useState<React.ReactNode>(null);
	const drawingCoordArray = useRef<number[][]>([]);
	const canUseTools = useRef(true);
	const [initialViewState, setInitialViewState] = useState<MapViewState>({
		latitude: 50.0,
		longitude: 15.0,
		zoom: 1.5,
	});

	const [activeDrawingGeoJson, setActiveDrawingGeoJson] = useState<GeoJSONFeatureCollection>({
		type: "FeatureCollection",
		features: [{ type: "Feature", geometry: { type: "LineString", coordinates: [] }, properties: {} }],
	});

	const [activeAnnotationGeoJson, setActiveAnnotationGeoJson] = useState<GeoJSONFeatureCollection>({
		type: "FeatureCollection",
		features: [
			{
				type: "Feature",
				geometry: { type: "Point", coordinates: [] },
				properties: {
					text: "",
				},
			},
		],
	});

	const drawingStyles: Omit<LineLayerSpecification, "id" | "source" | "type"> = {
		layout: {
			"line-cap": "round",
			"line-join": "round",
		},
		paint: {
			"line-color": "#ff0000",
			"line-width": 2,
			"line-opacity": ["case", ["boolean", ["feature-state", "markedDelete"], false], 0.25, 1],
		},
	};

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

	const annotationsSourceConfig: TileSourceConfig = {
		id: "public.smb_annotations",
		tiles: [
			getMapTileURL("public.smb_annotations", {
				filter: `project_id=${mapProject ? mapProject.id : -1}`,
			}),
		],
		params: {
			filter: `project_id=${mapProject ? mapProject.id : -1}`,
		},
	};

	useEffect(() => {
		const icon = tools.find((tool) => tool.tool === selectedTool)?.icon || "";
		switch (selectedTool) {
			case "hand":
				setCursor(undefined);
				setCursorIcon(null);
				break;
			case "draw":
				setCursor("crosshair");
				// rotate-[140deg]
				setCursorIcon(
					<div className="w-8 h-8 text-4xl translate-x-[8px] -translate-y-[44px] -scale-x-100">{icon}</div>,
				);
				break;
			case "pin":
				setCursor("crosshair");
				setCursorIcon(<div className="w-8 h-8 text-4xl -translate-x-[18.5px] -translate-y-[40px]">{icon}</div>);
				break;
			case "annotation":
				setCursor("copy");
				setCursorIcon(<div className="w-8 h-8 text-4xl -translate-y-12">{icon}</div>);
				break;
			case "attachment":
				setCursor("copy");
				setCursorIcon(
					<div className="w-8 h-8 text-4xl rotate-[60deg] translate-x-[10%] -translate-y-[150%]">{icon}</div>,
				);
				break;
			case "eraser":
				setCursor("none");
				setCursorIcon(<div className="w-8 h-8 text-4xl -translate-x-1/2 -translate-y-1/2">{icon}</div>);
				break;
		}
	}, [selectedTool]);

	useEffect(() => {
		if (!mapProject) {
			canUseTools.current = false;
			return;
		}

		canUseTools.current = true;

		if (isFirstLoad) {
			recenter();
		}
		updateTiles(pinsSourceConfig);
		updateTiles(drawingsSourceConfig);
		updateTiles(annotationsSourceConfig);
	}, [mapProject]);

	useEffect(() => {
		if (!mapRef.current) return;

		if (selectedTool === "hand") {
			mapRef.current.getMap().dragPan.enable();
		} else if (selectedTool === "draw") {
			mapRef.current.getMap().dragPan.disable();
		} else if (selectedTool === "pin") {
			mapRef.current.getMap().dragPan.enable();
		} else if (selectedTool === "annotation") {
			mapRef.current.getMap().dragPan.enable();
		} else if (selectedTool === "eraser") {
			mapRef.current.getMap().dragPan.disable();
		}
	}, [selectedTool]);

	const handleKeydown = (e: KeyboardEvent) => {
		if (!canUseTools.current) return;

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
		if (e.key === "4") setSelectedTool("annotation");
		if (e.key === "5") setSelectedTool("eraser");
	};

	const pushAnnotationToGeobase = async () => {
		setIsAnnotationEditing(false);

		if (!geobase.sessionRef.current || !mapProject || !mapProject.id) {
			console.error("Either not authenticated or no project selected");
			toast({
				description: (
					<span className="text-red-500">Failed to insert annotation. No session or project selected.</span>
				),
			});
			return;
		}

		const { data, error } = await geobase.supabase.from("smb_annotations").insert([
			{
				shape: `POINT(${annotationPosition.lng} ${annotationPosition.lat})`,
				meta: annotationText,
				project_id: mapProject.id,
				profile_id: geobase.sessionRef.current.user.id,
			},
		]);
		if (error) {
			console.error("Error inserting annotation", error);
			toast({
				description: <span className="text-red-500">Failed to insert annotation</span>,
			});
		} else {
			updateTiles(annotationsSourceConfig);
		}

		setAnnotationText("");
		setAnnotationPosition(new LngLat(0, 0));
	};

	const handleAnnotationBlur = () => {
		setIsAnnotationEditing(false);
		setAnnotationPosition(new LngLat(0, 0));
	};

	const handleAnnotationKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			pushAnnotationToGeobase();
		}
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

	useEffect(() => {
		featuresToEraseRef.current = featuresToErase;
	}, [featuresToErase]);

	useEffect(() => {
		setActiveAnnotationGeoJson({
			type: "FeatureCollection",
			features: [
				{
					type: "Feature",
					geometry: {
						type: "Point",
						coordinates: [annotationPosition.lng, annotationPosition.lat],
					},
					properties: {
						text: annotationText,
					},
				},
			],
		});
	}, [annotationText, annotationPosition]);

	const mapLoad = async () => {
		if (!mapRef.current) return;
		const m = mapRef.current.getMap();
		const pin = await m.loadImage("/assets/pin.png");
		// const attachment = await m.loadImage("/assets/attachment.png");
		const annotation = await m.loadImage("/assets/annotation.png");
		m.addImage("pin", pin.data);
		// m.addImage("attachment", attachment.data);
		m.addImage("annotation", annotation.data);
	};

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
		if (selectedTool === "pin") {
			if (!geobase.session || !mapProject || !mapProject.id) {
				console.error("Either not authenticated or no project selected");
				toast({
					description: <span className="text-red-500">Failed to insert pin</span>,
				});
				return;
			}

			const { data, error } = await geobase.supabase.from("smb_pins").insert([
				{
					shape: `POINT(${e.lngLat.lng} ${e.lngLat.lat})`,
					meta: JSON.stringify({
						lng: e.lngLat.lng,
						lat: e.lngLat.lat,
						color: "red",
					}),
					project_id: mapProject.id,
					profile_id: geobase.session.user.id,
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
		} else if (selectedTool === "annotation") {
			const placeholder = "New annotation";
			setIsAnnotationEditing(true);
			setAnnotationText(placeholder);
			setAnnotationPosition(e.lngLat);
			setTimeout(() => {
				if (annotationInputRef.current) {
					annotationInputRef.current.focus();
					annotationInputRef.current.setSelectionRange(0, placeholder.length);
				}
			}, 0);
		}
	};

	const updateTiles = (sourceConfig: TileSourceConfig) => {
		if (!mapRef.current || !mapProject) return;

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
		} else if (selectedTool === "eraser" && isErasing) {
			if (!mapRef.current) return;
			const m = mapRef.current.getMap();
			const features = m.queryRenderedFeatures(e.point, {
				layers: ["drawings-layer", "pins-layer", "annotations-layer"],
			});
			if (features.length > 0) {
				const featureId = `${features[0].layer.source} ${features[0].properties.id}`;
				setFeaturesToErase((prev) => {
					// Use a Set to ensure uniqueness
					const uniqueFeatures = new Set(prev);
					uniqueFeatures.add(featureId);
					return Array.from(uniqueFeatures);
				});
				m.setFeatureState(
					{
						source: features[0].source,
						sourceLayer: features[0].sourceLayer,
						id: features[0].id,
					},
					{ markedDelete: true },
				);
			}
		}
	};

	const mapMouseUp = async (e: MouseEvent) => {
		if (selectedTool === "draw") {
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

			if (!mapProject || !geobase.sessionRef.current) return;

			const { data, error } = await geobase.supabase.from("smb_drawings").insert([
				{
					shape: `LINESTRING(${drawingCoordArray.current.map((coord) => coord.join(" ")).join(",")})`,
					meta: "",
					project_id: mapProject.id,
					profile_id: geobase.sessionRef.current.user.id,
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
		} else if (selectedTool === "eraser") {
			setIsErasing(false);
			for (const featureId of featuresToEraseRef.current) {
				const [sourceId, featureIdStr] = featureId.split(" ");
				const table = sourceId.replace("public.", "");
				const id = parseInt(featureIdStr);
				await deleteFeature(table, id);
			}

			updateTiles(drawingsSourceConfig);
			updateTiles(pinsSourceConfig);
			updateTiles(annotationsSourceConfig);
		}

		window.removeEventListener("mouseup", mapMouseUp);
	};

	const mapMouseDown = (e: MapLayerMouseEvent) => {
		setIsMouseDown(true);
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
		} else if (selectedTool === "eraser") {
			setIsErasing(true);
		}
		window.addEventListener("mouseup", mapMouseUp);
	};

	const deleteFeature = async (table: string, id: number) => {
		if (!geobase.sessionRef.current) return;

		const { error } = await geobase.supabase.from(table).delete().eq("id", id);
		if (error) {
			console.error(`Error deleting ${table} with id ${id}`, error);
			toast({
				description: <span className="text-red-500">Failed to erase features</span>,
			});
		}
	};

	const transformRequest: RequestTransformFunction = (url, resourceType) => {
		if (
			resourceType === "Tile" &&
			url.startsWith(geobase.baseUrl) &&
			geobase.sessionRef &&
			geobase.sessionRef.current
		) {
			return {
				url,
				headers: {
					Authorization: `Bearer ${geobase.sessionRef.current.access_token}`,
				},
			};
		}
	};

	const recenter = () => {
		if (!mapRef.current) return;

		if (mapProject && mapProject.bounds) {
			mapRef.current.fitBounds(
				new LngLatBounds(
					new LngLat(mapProject.bounds.west, mapProject.bounds.south),
					new LngLat(mapProject.bounds.east, mapProject.bounds.north),
				),
				{
					padding: 100,
					duration: 1000,
				},
			);
		} else if (initialViewState.latitude && initialViewState.longitude) {
			mapRef.current.flyTo({
				center: {
					lat: initialViewState.latitude,
					lng: initialViewState.longitude,
				},
				zoom: initialViewState.zoom,
				duration: 1000,
			});
		}
	};

	return (
		<div className="relative flex w-full h-full">
			<Map
				ref={mapRef}
				attributionControl={false}
				mapStyle={theme.resolvedTheme === "dark" ? neighborhoodStyles.dark : neighborhoodStyles.light}
				initialViewState={initialViewState}
				onLoad={mapLoad}
				onMouseUp={() => setIsMouseDown(false)}
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
						<Layer
							{...{
								id: "drawing",
								type: "line",
								source: "active-drawing-source",
								...drawingStyles,
							}}
						/>
					</Source>
					<Source type="vector" {...drawingsSourceConfig}>
						<Layer
							id="drawings-layer"
							type="line"
							source-layer={drawingsSourceConfig.id}
							{...drawingStyles}
						/>
					</Source>
					<Source type="vector" {...pinsSourceConfig}>
						<Layer
							id="pins-layer"
							type="symbol"
							source-layer={pinsSourceConfig.id}
							layout={{
								"icon-image": "pin",
								"icon-anchor": "bottom",
								"icon-size": 0.3,
								"icon-offset": [0, 10],
								"icon-allow-overlap": true,
							}}
							paint={{
								"icon-opacity": [
									"case",
									["boolean", ["feature-state", "markedDelete"], false],
									0.25,
									1,
								],
							}}
						/>
					</Source>
					<Source type="geojson" data={activeAnnotationGeoJson} id="active-annotation">
						<Layer
							id="active-annotation-layer"
							source="active-annotation"
							type="symbol"
							layout={{
								"text-field": ["get", "text"],
								"text-size": 20,
								"text-offset": [0, 0],
								"text-anchor": "center",
							}}
							paint={{
								"text-color": "black",
								"text-halo-color": "white",
								"text-halo-width": 1,
							}}
						/>
					</Source>
					<Source type="vector" {...annotationsSourceConfig}>
						<Layer
							id="annotations-layer"
							type="symbol"
							source-layer={annotationsSourceConfig.id}
							layout={{
								"text-field": ["get", "meta"],
								"text-size": 20,
								"text-offset": [0, 0],
								"text-anchor": "center",
							}}
							paint={{
								"text-color": "black",
								"text-halo-color": "white",
								"text-halo-width": 1,
								"text-opacity": [
									"case",
									["boolean", ["feature-state", "markedDelete"], false],
									0.25,
									1,
								],
							}}
						/>
					</Source>
					{isAnnotationEditing ? (
						<Marker longitude={annotationPosition.lng} latitude={annotationPosition.lat}>
							<Input
								ref={annotationInputRef}
								disabled={!isAnnotationEditing}
								value={annotationText}
								onChange={(e) => setAnnotationText(e.target.value)}
								onKeyDown={(e) => handleAnnotationKeyDown(e)}
								onBlur={(e) => handleAnnotationBlur()}
								className="bg-white dark:bg-zinc-900 text-lg text-center"
							/>
						</Marker>
					) : null}
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
				{!annotationText ? <div className={cn(isMouseDown ? "translate-y-1" : "")}>{cursorIcon}</div> : null}
			</Cursor>
		</div>
	);
}
