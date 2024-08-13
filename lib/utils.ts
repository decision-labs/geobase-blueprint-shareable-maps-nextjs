import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function createUUID() {
	if (typeof window === "undefined") return "";
	const crypto = window.crypto || (window as any).msCrypto;
	if (!crypto) {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
			const r = (Math.random() * 16) | 0;
			const v = c === "x" ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	}
	const array = new Uint32Array(4);
	crypto.getRandomValues(array);
	const parts = Array.from(array).map((n) => n.toString(16).padStart(8, "0"));

	return `${parts[0]}-${parts[1]}-${parts[2]}-${parts[3]}`;
}

export type GeoJSONFeature = {
	type: "Feature";
	geometry: {
		type: "Point" | "LineString" | "Polygon";
		coordinates: number[] | number[][];
	};
	properties: Record<string, any>;
};

export type GeoJSONFeatureCollection = {
	type: "FeatureCollection";
	features: GeoJSONFeature[];
};
