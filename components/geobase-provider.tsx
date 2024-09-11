"use client";
import { AuthSession, createClient, SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { MaterialSymbol } from "react-material-symbols";

export type Profile = {
	id: string;
	nickname: string;
	email: string;
	photo_url: string;
};

export type GeobaseContextType = {
	supabase: SupabaseClient;
	profile: Profile | null;
	setProfile?: (profile: Profile | null) => void;
	session: AuthSession | null;
	sessionRef: ReturnType<typeof useRef<AuthSession | null>>;
	baseUrl: string;
};

const GEOBASE_URL = process.env.NEXT_PUBLIC_GEOBASE_URL as string;
const GEOBASE_ANON_KEY = process.env.NEXT_PUBLIC_GEOBASE_ANON_KEY as string;

if (!GEOBASE_URL) {
	throw new Error("Missing env variable NEXT_PUBLIC_GEOBASE_URL");
}

if (!GEOBASE_ANON_KEY) {
	throw new Error("Missing env variable NEXT_PUBLIC_GEOBASE_ANON_KEY");
}

const supabase = createClient(GEOBASE_URL, GEOBASE_ANON_KEY);

export function getMapTileURL(tileName: string, params: Record<string, string> = {}) {
	const searchParams = new URLSearchParams({
		apikey: GEOBASE_ANON_KEY,
		...params,
	});
	return `${GEOBASE_URL}/tileserver/v1/${tileName}/{z}/{x}/{y}.pbf?${searchParams}`;
}

export const useGeobase = () => {
	const context = useContext(GeobaseContext);
	if (context === undefined) {
		throw new Error("useGeobase must be used within a SupabaseContextProvider");
	}
	return context;
};

export const GeobaseContext = createContext<GeobaseContextType>({
	supabase,
	profile: null,
	session: null,
	baseUrl: GEOBASE_URL,
	sessionRef: { current: null },
});

export function handleAuthRedirects(auth: AuthSession | null, router: ReturnType<typeof useRouter>) {
	if (
		auth &&
		(router.pathname === "/sign-in" || router.pathname === "/sign-up" || router.pathname === "/reset-password")
	) {
		router.push("/");
		return;
	}
}

export function GeobaseContextProvider({ children }: { children: React.ReactNode }) {
	const [session, setSession] = useState<AuthSession | null>(null);
	const prevSessionRef = useRef<AuthSession | null>(null);
	const prevPathnameRef = useRef<string | null>(null);
	const sessionRef = useRef<AuthSession | null>(null);
	const [profile, setProfile] = useState<Profile | null>(null);
	const router = useRouter();
	const pathname = usePathname();
	const { toast } = useToast();

	const updateProfileData = async (session: AuthSession | null) => {
		if (session) {
			let { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id);

			if (error) {
				console.error("Error getting profile: ", error.message);
			} else if (data && data.length > 0) {
				setProfile(data[0]);
			}
		} else {
			setProfile(null);
		}
	};

	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, latestSession) => {
			if (event === "INITIAL_SESSION") {
				handleAuthRedirects(latestSession, router);
			}
			setSession(latestSession);
			sessionRef.current = latestSession;

			updateProfileData(latestSession);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	useEffect(() => {
		if (prevPathnameRef.current !== pathname) {
			if (prevPathnameRef.current !== null) {
				handleAuthRedirects(session, router);
			}
			prevPathnameRef.current = pathname;
		}
	}, [pathname]);

	useEffect(() => {
		if (prevSessionRef.current === null && session && router.pathname !== "/update-password") {
			handleAuthRedirects(session, router);
			toast({
				description: (
					<span className="flex items-center gap-2">
						<MaterialSymbol icon="waving_hand" size={20} weight={300} grade={300} />
						Welcome back, {session.user?.email}
					</span>
				),
			});
		} else if (prevSessionRef.current !== null && session === null) {
			console.log("Logged out");
			handleAuthRedirects(session, router);
		}
		prevSessionRef.current = session;
	}, [session]);

	return (
		<GeobaseContext.Provider value={{ supabase, session, profile, setProfile, sessionRef, baseUrl: GEOBASE_URL }}>
			{children}
		</GeobaseContext.Provider>
	);
}
