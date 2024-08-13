import { cn } from "@/lib/utils";
import { MapViewContext } from "./map-view";
import { useContext } from "react";
import { tools } from "@/lib/consts";

export type Tool = "hand" | "draw" | "pin" | "sign" | "attachment";

export function Toolbar() {
	const mapView = useContext(MapViewContext);
	return (
		<div className="absolute flex items-center justify-between max-w-full w-fit h-8 bottom-0 left-1/2 -translate-x-1/2 py-2 px-3 rounded-t-3xl bg-white/30 dark:bg-zinc-600/30 backdrop-blur-md border border-transparent dark:border-zinc-700/50 shadow-xl z-50 text-5xl">
			{tools.map(({ icon, tool }) => (
				<button
					key={tool}
					onClick={() => {
						if (mapView.setSelectedTool) mapView.setSelectedTool(tool);
					}}
					className={cn(
						"py-3 px-4 transition focus:outline-none",
						mapView.selectedTool === tool ? "-translate-y-5" : "hover:-translate-y-3",
					)}
				>
					{icon}
				</button>
			))}
		</div>
	);
}
