import { Tool } from "@/components/views/toolbar";
import { StyleSpecification } from "maplibre-gl";

export const tools: {
	icon: string;
	tool: Tool;
}[] = [
	{
		icon: "🖐️",
		tool: "hand",
	},
	{
		icon: "✏️",
		tool: "draw",
	},
	{
		icon: "📍",
		tool: "pin",
	},
	{
		icon: "💬",
		tool: "annotation",
	},
	// {
	// 	icon: "📎",
	// 	tool: "attachment",
	// },
	{
		icon: "🧽",
		tool: "eraser",
	},
];

export const neighborhoodStyles: {
	light: StyleSpecification;
	dark: StyleSpecification;
} = {
	light: {
		name: "Neighborhood Light Style",
		version: 8,
		glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
		sources: {
			osm: {
				type: "vector",
				url: "https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json",
			},
		},
		layers: [
			{
				id: "background",
				type: "background",
				paint: {
					"background-color": "#f4f4f4",
				},
			},
			{
				id: "landcover",
				type: "fill",
				source: "osm",
				"source-layer": "landcover",
				paint: {
					"fill-color": "#c0d9af",
				},
			},
			{
				id: "water",
				type: "fill",
				source: "osm",
				"source-layer": "water",
				paint: {
					"fill-color": "#a0cfdf",
				},
			},
			{
				id: "waterway",
				type: "line",
				source: "osm",
				"source-layer": "waterway",
				paint: {
					"line-color": "#a0cfdf",
					"line-width": 1,
				},
			},
			{
				id: "transportation",
				type: "line",
				source: "osm",
				"source-layer": "transportation",
				paint: {
					"line-color": "#c0c0c0",
					"line-width": 1,
				},
			},
			{
				id: "aeroway",
				type: "fill",
				source: "osm",
				"source-layer": "aeroway",
				paint: {
					"fill-color": "#e0e0e0",
				},
			},
			{
				id: "boundary",
				type: "line",
				source: "osm",
				"source-layer": "boundary",
				paint: {
					"line-color": "#c0c0c0",
					"line-width": 1,
				},
			},
			// {
			// 	id: "buildings",
			// 	type: "fill",
			// 	source: "osm",
			// 	"source-layer": "building",
			// 	paint: {
			// 		"fill-color": ["case", ["boolean", ["feature-state", "hover"], false], "#ff0000", "#f4f4f4"],
			// 	},
			// },
			// {
			// 	id: "building-outlines",
			// 	type: "line",
			// 	source: "osm",
			// 	"source-layer": "building",
			// 	paint: {
			// 		"line-color": "#A6A49F",
			// 		"line-width": 1,
			// 	},
			// },
		],
	},
	dark: {
		name: "Neighborhood Dark Style",
		version: 8,
		glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
		sources: {
			osm: {
				type: "vector",
				url: "https://tiles.basemaps.cartocdn.com/vector/carto.streets/v1/tiles.json",
			},
		},
		layers: [
			{
				id: "background",
				type: "background",
				paint: {
					"background-color": "#101010",
				},
			},
			{
				id: "landcover",
				type: "fill",
				source: "osm",
				"source-layer": "landcover",
				paint: {
					"fill-color": "#152A22",
				},
			},
			{
				id: "water",
				type: "fill",
				source: "osm",
				"source-layer": "water",
				paint: {
					"fill-color": "#1C3262",
				},
			},
			{
				id: "waterway",
				type: "line",
				source: "osm",
				"source-layer": "waterway",
				paint: {
					"line-color": "#1C3262",
					"line-width": 1,
				},
			},
			{
				id: "transportation",
				type: "line",
				source: "osm",
				"source-layer": "transportation",
				paint: {
					"line-color": "#3A3B4950",
					"line-width": 1,
				},
			},
			{
				id: "boundary",
				type: "line",
				source: "osm",
				"source-layer": "boundary",
				paint: {
					"line-color": "#FFFFFF10",
					"line-width": 1,
				},
			},
		],
	},
} as const;
