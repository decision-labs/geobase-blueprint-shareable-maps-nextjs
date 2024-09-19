import { createContext, useContext, useState } from "react";
import { Profile } from "@/components/providers/geobase-provider";

export type MapProject = {
	id?: number;
	uuid: string;
	created_at?: Date;
	updated_at?: Date;
	published: boolean;
	title: string;
	description: string;
	bounds: {
		north: number;
		east: number;
		south: number;
		west: number;
	} | null;
	profile_id: string;
	profile?: Profile;
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
