import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
	return (
		<Html lang="en">
			<Head />
			<body className="bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
