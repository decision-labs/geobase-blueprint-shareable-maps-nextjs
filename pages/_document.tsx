import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
				<link
					href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&family=Patrick+Hand&display=swap"
					rel="stylesheet"
				/>
			</Head>
			<body className="bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
