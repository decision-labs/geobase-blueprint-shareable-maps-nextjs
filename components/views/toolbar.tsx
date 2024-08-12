import { cn } from "@/lib/utils";

export type Tool = "hand" | "draw" | "pin" | "sign" | "attachment";

export function Toolbar({
	selectedTool,
	setSelectedTool,
}: {
	selectedTool: Tool;
	setSelectedTool: (tool: Tool) => void;
}) {
	return (
		<div className="absolute flex items-center justify-between max-w-full w-fit h-8 bottom-0 left-1/2 -translate-x-1/2 py-2 px-3 rounded-t-3xl bg-white/30 dark:bg-zinc-600/30 backdrop-blur-md border border-transparent dark:border-zinc-800 shadow-xl z-50 text-6xl">
			<button
				onClick={() => setSelectedTool("hand")}
				className={cn(
					"py-3 px-4 transition focus:outline-none",
					selectedTool === "hand" ? "-translate-y-5" : "-translate-y-1.5 hover:-translate-y-3",
				)}
			>
				🖐️
			</button>
			<button
				onClick={() => setSelectedTool("draw")}
				className={cn(
					"py-3 px-4 transition focus:outline-none",
					selectedTool === "draw" ? "-translate-y-5" : "-translate-y-1.5 hover:-translate-y-3",
				)}
			>
				✏️
			</button>
			<button
				onClick={() => setSelectedTool("pin")}
				className={cn(
					"py-3 px-4 transition focus:outline-none",
					selectedTool === "pin" ? "-translate-y-5" : "-translate-y-1.5 hover:-translate-y-3",
				)}
			>
				📍
			</button>
			<button
				onClick={() => setSelectedTool("sign")}
				className={cn(
					"py-3 px-4 transition focus:outline-none",
					selectedTool === "sign" ? "-translate-y-5" : "-translate-y-1.5 hover:-translate-y-3",
				)}
			>
				💬
			</button>
			<button
				onClick={() => setSelectedTool("attachment")}
				className={cn(
					"py-3 px-4 transition focus:outline-none",
					selectedTool === "attachment" ? "-translate-y-5" : "-translate-y-1.5 hover:-translate-y-3",
				)}
			>
				📎
			</button>
		</div>
	);
}
