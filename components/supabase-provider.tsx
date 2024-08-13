"use client";
import { AuthSession, createClient, SupabaseClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { MaterialSymbol } from "react-material-symbols";

export type SupabaseContextType = {
	client: SupabaseClient;
	auth: AuthSession | null;
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

export function getMapTileURL(tileName: string, key: string = GEOBASE_ANON_KEY, params: Record<string, string> = {}) {
	const searchParams = new URLSearchParams({
		...params,
		apikey: key,
	});
	const url = `${GEOBASE_URL}/tileserver/v1/${tileName}/{z}/{x}/{y}.pbf?${searchParams}`;
	console.log(url);
	return url;
}

export const useSupabase = () => {
	const context = useContext(SupabaseContext);
	if (context === undefined) {
		throw new Error("useSupabase must be used within a SupabaseContextProvider");
	}
	return context;
};

export const SupabaseContext = createContext<SupabaseContextType>({ client: supabase, auth: null });

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
	const router = useRouter();
	const pathname = usePathname();
	const { toast } = useToast();

	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			if (event === "INITIAL_SESSION") {
				handleAuthRedirects(session, router);
			}
			setAuth(session);
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

	return <SupabaseContext.Provider value={{ client: supabase, auth }}>{children}</SupabaseContext.Provider>;
}
