"use client";
import { AuthSession, createClient, SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { MaterialSymbol } from "react-material-symbols";
import { RequestTransformFunction } from "maplibre-gl";

export type Profile = {
	nickname: string;
	email: string;
	photo_url: string;
};

export type SupabaseContextType = {
	client: SupabaseClient;
	profile: Profile | null;
	auth: AuthSession | null;
	session: ReturnType<typeof useRef<AuthSession | null>>;
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

export const useSupabase = () => {
	const context = useContext(SupabaseContext);
	if (context === undefined) {
		throw new Error("useSupabase must be used within a SupabaseContextProvider");
	}
	return context;
};

export const SupabaseContext = createContext<SupabaseContextType>({
	client: supabase,
	profile: null,
	auth: null,
	baseUrl: GEOBASE_URL,
	session: { current: null },
});

export function handleAuthRedirects(auth: AuthSession | null, router: ReturnType<typeof useRouter>) {
	if (
		!auth &&
		router.pathname !== "/sign-in" &&
		router.pathname !== "/sign-up" &&
		router.pathname !== "/reset-password" &&
		router.pathname !== "/update-password"
	) {
		router.push("/sign-in");
		return;
	} else if (
		auth &&
		(router.pathname === "/sign-in" || router.pathname === "/sign-up" || router.pathname === "/reset-password")
	) {
		router.push("/");
		return;
	}
}

export function SupabaseContextProvider({ children }: { children: React.ReactNode }) {
	const [auth, setAuth] = useState<AuthSession | null>(null);
	const prevAuthRef = useRef<AuthSession | null>(null);
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
		} = supabase.auth.onAuthStateChange((event, session) => {
			if (event === "INITIAL_SESSION") {
				handleAuthRedirects(session, router);
			}
			setAuth(session);
			sessionRef.current = session;

			updateProfileData(session);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	useEffect(() => {
		if (prevPathnameRef.current !== pathname) {
			if (prevPathnameRef.current !== null) {
				handleAuthRedirects(auth, router);
			}
			prevPathnameRef.current = pathname;
		}
	}, [pathname]);

	useEffect(() => {
		if (prevAuthRef.current === null && auth && router.pathname !== "/update-password") {
			handleAuthRedirects(auth, router);
			toast({
				description: (
					<span className="flex items-center gap-2">
						<MaterialSymbol icon="waving_hand" size={20} weight={300} grade={300} />
						Welcome back, {auth.user?.email}
					</span>
				),
			});
		} else if (prevAuthRef.current !== null && auth === null) {
			console.log("Logged out");
			handleAuthRedirects(auth, router);
		}
		prevAuthRef.current = auth;
	}, [auth]);

	return (
		<SupabaseContext.Provider
			value={{ client: supabase, auth, profile, session: sessionRef, baseUrl: GEOBASE_URL }}
		>
			{children}
		</SupabaseContext.Provider>
	);
}
