import "@/styles/globals.css";
import "react-material-symbols/rounded";
import { GeobaseContextProvider } from "@/components/providers/geobase-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import type { AppProps } from "next/app";
import { Toaster } from "@/components/ui/toaster";

export default function App({ Component, pageProps }: AppProps) {
	return (
		<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
			<GeobaseContextProvider>
				<Component {...pageProps} />
				<Toaster />
			</GeobaseContextProvider>
		</ThemeProvider>
	);
}
