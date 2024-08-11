import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { SupabaseContext } from "@/components/supabase-provider";
import { Layout } from "@/components/layout";

export default function Home() {
	const supabase = useContext(SupabaseContext);

	return (
		<Layout>
			<main className={`flex min-h-screen h-full w-full`}>
				<Map
					mapStyle="https://demotiles.maplibre.org/style.json"
					style={{
						position: "fixed",
						height: "100vh",
						width: "100vw",
					}}
					initialViewState={{
						longitude: -122.4,
						latitude: 37.8,
						zoom: 14,
					}}
				/>
				<div className="relative w-fit h-fit">
					<h1 className={`text-4xl`}>Hello World</h1>
					<Button
						variant="destructive"
						className={`mt-4`}
						onClick={() => {
							supabase.client.auth.signOut();
						}}
					>
						Log Out
					</Button>
				</div>
			</main>
		</Layout>
	);
}
