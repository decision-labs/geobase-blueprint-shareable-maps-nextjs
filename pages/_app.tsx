import "@/styles/globals.css";
import "react-material-symbols/rounded";
import { SupabaseContextProvider } from "@/components/supabase-provider";
import { ThemeProvider } from "@/components/theme-provider";
import type { AppProps } from "next/app";
import { Toaster } from "@/components/ui/toaster";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
			<SupabaseContextProvider>
				<Component {...pageProps} />
				<Toaster />
			</SupabaseContextProvider>
		</ThemeProvider>
	);
}
