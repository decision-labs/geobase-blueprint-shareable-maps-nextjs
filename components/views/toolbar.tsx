import { cn } from "@/lib/utils";
import { useContext } from "react";
import { tools } from "@/lib/consts";
import { useMapController } from "./map-controller";
import { useMapProject } from "@/components/providers/project-provider";

export type Tool = "hand" | "draw" | "pin" | "annotation" | "attachment" | "eraser";

export function Toolbar() {
	const mapController = useMapController();
	const { mapProject } = useMapProject();

	if (!mapProject) return null;

	return (
		<div className="absolute flex items-center justify-between max-w-full w-fit h-16 bottom-3 left-1/2 -translate-x-1/2 py-2 px-3 rounded-full bg-white/30 dark:bg-zinc-600/30 backdrop-blur-md border border-transparent dark:border-zinc-700/50 shadow-xl z-50 text-3xl">
			{tools.map(({ icon, tool }) => (
				<div key={tool} className="relative flex flex-col items-center">
					<button
						onClick={() => {
							if (mapController) mapController.setSelectedTool(tool);
						}}
						className={cn(
							"py-3 px-4 transition-[margin] focus:outline-none hover:opacity-80",
							mapController && mapController.selectedTool === tool ? "-mt-3" : "",
						)}
					>
						{icon}
					</button>
					{mapController && mapController.selectedTool === tool && (
						<div className="absolute bottom-0.5 w-4 h-1 rounded-md bg-current opacity-50" />
					)}
				</div>
			))}
		</div>
	);
}
