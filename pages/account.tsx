import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { Button } from "@/components/ui/button";
import { useContext } from "react";
import { SupabaseContext } from "@/components/supabase-provider";
import { Layout } from "@/components/layout";

export default function Account() {
	const supabase = useContext(SupabaseContext);

	return (
		<Layout>
			<main className={`flex min-h-screen h-full w-full`}>
				<div className="relative w-fit h-fit">
					<h1 className={`text-4xl`}>Account</h1>
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
