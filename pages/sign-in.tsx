import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useContext, useState } from "react";
import { SupabaseContext } from "@/components/supabase-provider";
import { MaterialSymbol } from "react-material-symbols";
import { useRouter } from "next/router";
import { Spinner } from "@/components/ui/spinner";
import { Layout } from "@/components/layout";

export default function SignIn() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const supabase = useContext(SupabaseContext);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		setErrorMessage("");
		e.preventDefault();

		setIsLoading(true);
		const { error } = await supabase.client.auth.signInWithPassword({
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
		<Layout>
			<main className={`flex min-h-screen h-full w-full items-center justify-center`}>
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
		</Layout>
	);
}
