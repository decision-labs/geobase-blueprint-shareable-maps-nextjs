import { Button } from "@/components/ui/button";
import { useContext, useEffect, useState } from "react";
import { SupabaseContext } from "@/components/supabase-provider";
import { Layout } from "@/components/layout";
import { MapView } from "@/components/views/map-view";

export default function Home() {
	// Here we get the map data, this would apply to other routes too.
	return (
		<Layout>
			<MapView />
		</Layout>
	);
}
