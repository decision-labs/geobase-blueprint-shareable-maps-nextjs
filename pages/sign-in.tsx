import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useContext, useState } from "react";
import { GeobaseContext, useGeobase } from "@/components/providers/geobase-provider";
import { MaterialSymbol } from "react-material-symbols";
import { useRouter } from "next/router";
import { Spinner } from "@/components/ui/spinner";

export default function SignIn() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const geobase = useGeobase();

	async function signInWithGithub() {
		setErrorMessage("");
		setIsLoading(true);

		const { data, error } = await geobase.supabase.auth.signInWithOAuth({
			provider: "github",
			options: {
				redirectTo: `http://127.0.0.1:3001/`,
			},
		});

		setIsLoading(false);

		if (error) {
			setErrorMessage(error.message);
			return;
		}
	}

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		setErrorMessage("");
		e.preventDefault();

		setIsLoading(true);
		const { error } = await geobase.supabase.auth.signInWithPassword({
			email,
			password,
		});
		setIsLoading(false);

		if (error) {
			setErrorMessage(error.message);
			return;
		}
	}

	return (
		<main
			className={`flex min-h-screen h-full w-full items-center justify-center bg-gradient-to-t from-blue-300 to-white dark:from-zinc-900 dark:to-zinc-950`}
		>
			<div className="flex flex-col gap-8 items-center justify-center w-72">
				<h1 className={`text-4xl text-center`}>Welcome Back</h1>
				<form onSubmit={handleSubmit} className="w-full">
					<Card className="w-full">
						<CardHeader>
							<CardTitle>Sign In</CardTitle>
							<CardDescription>
								Don&apos;t have an account?{" "}
								<Link href="/sign-up" className="text-blue-500 hover:underline">
									Sign Up
								</Link>
							</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col gap-3">
							<Input
								required
								disabled={isLoading}
								type="email"
								id="email"
								placeholder="Email"
								value={email}
								onChange={(e) => setEmail(e.currentTarget.value)}
							/>
							<Input
								required
								disabled={isLoading}
								type="password"
								id="password"
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.currentTarget.value)}
							/>
							{errorMessage && (
								<p className="text-red-500 text-sm flex items-center gap-2">
									<MaterialSymbol icon="error" size={20} weight={400} grade={400} />
									{errorMessage}
								</p>
							)}
						</CardContent>
						<CardFooter>
							<div className="flex flex-col w-full gap-4">
								<Button type="submit" className="w-full gap-2" disabled={isLoading}>
									{isLoading ? <Spinner className="opacity-50" /> : null}
									Sign In
								</Button>
								<Button
									variant={"outline"}
									className="w-full gap-2"
									onClick={signInWithGithub}
									disabled={isLoading}
								>
									Sign In with Github
								</Button>
								<Link
									href="/reset-password"
									className="text-blue-500 text-sm text-center hover:underline"
								>
									Forgot Password?
								</Link>
							</div>
						</CardFooter>
					</Card>
				</form>
			</div>
		</main>
	);
}
