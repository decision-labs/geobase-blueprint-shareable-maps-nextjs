import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

export default function NotFound() {
	const router = useRouter();
	return (
		<main
			className={`flex min-h-screen h-full w-full items-center justify-center bg-gradient-to-t from-blue-300 to-white dark:from-zinc-900 dark:to-zinc-950`}
		>
			<div className="flex flex-col gap-8 items-center justify-center">
				<h1 className={`text-4xl text-center`}>404 - Page Not Found</h1>
				<p className={`text-center`}>The map or page you are looking for does not exist.</p>
				<Button
					onClick={() => {
						router.push("/new");
					}}
				>
					Create a new map
				</Button>
			</div>
		</main>
	);
}
