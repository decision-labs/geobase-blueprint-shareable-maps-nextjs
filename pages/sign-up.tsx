import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { GeobaseContext, useGeobase } from "@/components/providers/geobase-provider";
import { MaterialSymbol } from "react-material-symbols";
import { Spinner } from "@/components/ui/spinner";

export default function SignUp() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordConfirm, setPasswordConfirm] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const geobase = useGeobase();

	useEffect(() => {
		setErrorMessage("");
	}, [email, password, passwordConfirm]);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		setErrorMessage("");
		setSuccessMessage("");
		e.preventDefault();

		if (password !== passwordConfirm) {
			setErrorMessage("Passwords do not match");
			return;
		}

		if (password.length < 8) {
			setErrorMessage("Password must be at least 8 characters long");
			return;
		}

		setIsLoading(true);

		const { data, error } = await geobase.supabase.auth.signUp({
			email,
			password,
			options: {
				emailRedirectTo: "/",
				data: {
					nickname: email.split("@")[0],
					photo_url: "",
				},
			},
		});

		if (error) {
			setIsLoading(false);
			setErrorMessage(error.message);
			return;
		}

		setEmail("");
		setPassword("");
		setPasswordConfirm("");
		setSuccessMessage("Check your email for a confirmation link");
		setIsLoading(false);
	}

	return (
		<main
			className={`flex min-h-screen h-full w-full items-center justify-center bg-gradient-to-t from-blue-300 to-white dark:from-zinc-900 dark:to-zinc-950`}
		>
			<div className="flex flex-col gap-8 items-center justify-center w-72">
				<h1 className={`text-4xl text-center`}>Share Maps</h1>
				<form onSubmit={handleSubmit} className="w-full">
					<Card className="w-full">
						<CardHeader>
							<CardTitle>Sign Up</CardTitle>
							<CardDescription>
								Already have an account?{" "}
								<Link href="/sign-in" className="text-blue-500 hover:underline">
									Sign In
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
							<Input
								required
								disabled={isLoading}
								type="password"
								id="password-confirm"
								placeholder="Confirm Password"
								value={passwordConfirm}
								onChange={(e) => setPasswordConfirm(e.currentTarget.value)}
							/>
							{errorMessage && (
								<p className="text-red-500 text-sm flex items-center gap-2">
									<MaterialSymbol icon="error" size={20} weight={400} grade={400} />
									{errorMessage}
								</p>
							)}
							{successMessage && (
								<p className="text-green-500 text-sm flex items-center gap-2">
									<MaterialSymbol icon="check_circle" size={20} weight={400} grade={400} />
									{successMessage}
								</p>
							)}
						</CardContent>
						<CardFooter>
							<div className="flex flex-col w-full gap-4">
								<Button type="submit" className="w-full gap-2" disabled={isLoading}>
									{isLoading ? <Spinner className="opacity-50" /> : null}
									Sign Up
								</Button>
							</div>
						</CardFooter>
					</Card>
				</form>
			</div>
		</main>
	);
}
