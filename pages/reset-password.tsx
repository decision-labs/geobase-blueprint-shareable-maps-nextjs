import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { useGeobase } from "@/components/providers/geobase-provider";
import { Spinner } from "@/components/ui/spinner";
import { MaterialSymbol } from "react-material-symbols";

export default function ResetPassword() {
	const [email, setEmail] = useState("");
	const [success, setSuccess] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const geobase = useGeobase();

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		setIsLoading(true);
		await geobase.supabase.auth.resetPasswordForEmail(email, {
			redirectTo: "/reset-password",
		});
		setIsLoading(false);
		setSuccess(true);
	}

	return (
		<main
			className={`flex min-h-screen h-full w-full items-center justify-center bg-gradient-to-t from-blue-300 to-white dark:from-zinc-900 dark:to-zinc-950`}
		>
			<div className="flex flex-col gap-8 items-center justify-center w-96">
				<h1 className={`text-4xl text-center`}>Forgot your password?</h1>
				<form onSubmit={handleSubmit} className="w-full">
					<Card className="w-full">
						<CardHeader>
							<CardTitle>Reset Password</CardTitle>
							<CardDescription>Receive a password reset link in your email</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col gap-3">
							<Input
								required
								disabled={isLoading}
								type="email"
								id="email"
								placeholder="Email"
								onInputCapture={(e) => setEmail(e.currentTarget.value)}
							/>
							{success && (
								<p className="text-green-500 text-sm flex items-center gap-2">
									<MaterialSymbol icon="check_circle" size={20} weight={400} grade={400} />
									We&apos;ve sent a password reset link to your email.
								</p>
							)}
						</CardContent>
						<CardFooter>
							<div className="flex flex-col w-full gap-4">
								<Button type="submit" className="w-full gap-2" disabled={isLoading}>
									{isLoading ? <Spinner className="opacity-50" /> : null}
									Send Reset Link
								</Button>
								<Link href="/sign-in" className="text-blue-500 text-sm text-center hover:underline">
									Back to login
								</Link>
							</div>
						</CardFooter>
					</Card>
				</form>
			</div>
		</main>
	);
}
