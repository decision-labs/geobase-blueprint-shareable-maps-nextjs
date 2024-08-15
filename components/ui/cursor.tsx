import { useEffect, useState } from "react";

export function Cursor({ children }: { children: React.ReactNode }) {
	const [cursor, setCursor] = useState({ x: 0, y: 0 });

	function handleMouseMove(e: MouseEvent) {
		setCursor({ x: e.clientX, y: e.clientY });
	}

	useEffect(() => {
		window.addEventListener("mousemove", handleMouseMove);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, []);
	return (
		<div
			className="pointer-events-none fixed left-0 top-0 transform-gpu"
			style={{
				transform: `translate(${cursor.x}px, ${cursor.y}px)`,
			}}
		>
			{children}
		</div>
	);
}
