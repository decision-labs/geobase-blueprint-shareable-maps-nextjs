import { createContext, useContext, useState } from "react";

export type MapProject = {
	id: number;
	uuid: string;
	title: string;
	description: string;
	bounds: {
		north: number;
		east: number;
		south: number;
		west: number;
	} | null;
	created_by: string | null;
	created_at: string;
	is_draft: boolean;
};

export const MapProjectContext = createContext<{
	mapProject?: MapProject;
	setMapProject?: (mapProject: MapProject) => void;
}>({});

export function useMapProject() {
	const context = useContext(MapProjectContext);
	if (context === undefined) {
		throw new Error("useMapProject must be used within a MapProjectProvider");
	}
	return context;
}

export function ProjectLayout({ children }: { children: React.ReactNode }) {
	return <main className={`flex min-h-screen h-full w-full relative`}>{children}</main>;
}
