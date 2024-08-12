import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
	return (
		<div className={cn("inline-block relative w-[1.25em] h-[1.25em]", className)}>
			<div className="box-border block absolute mt-[0.07em] ml-[0.07em] w-[90%] h-[90%] border-[0.15em] border-solid border-current rounded-full animate-spinner border-t-transparent border-r-transparent border-b-transparent"></div>
			<div
				className="box-border block absolute mt-[0.07em] ml-[0.07em] w-[90%] h-[90%] border-[0.15em] border-solid border-current rounded-full animate-spinner border-t-transparent border-r-transparent border-b-transparent"
				style={{ animationDelay: "-0.45s" }}
			></div>
			<div
				className="box-border block absolute mt-[0.07em] ml-[0.07em] w-[90%] h-[90%] border-[0.15em] border-solid border-current rounded-full animate-spinner border-t-transparent border-r-transparent border-b-transparent"
				style={{ animationDelay: "-0.3s" }}
			></div>
			<div
				className="box-border block absolute mt-[0.07em] ml-[0.07em] w-[90%] h-[90%] border-[0.15em] border-solid border-current rounded-full animate-spinner border-t-transparent border-r-transparent border-b-transparent"
				style={{ animationDelay: "-0.15s" }}
			></div>
		</div>
	);
}
