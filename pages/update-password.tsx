import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import { SupabaseContext } from "@/components/supabase-provider";
import { Spinner } from "@/components/ui/spinner";
import { Layout } from "@/components/layout";
import { MaterialSymbol } from "react-material-symbols";
import { useRouter } from "next/router";

export default function UpdatePassword() {
	const [success, setSuccess] = useState(false);
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [urlHasToken, setUrlHasToken] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const supabase = useContext(SupabaseContext);
	const router = useRouter();

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const token = urlParams.get("access_token");
		setUrlHasToken(!!token);

		if (!token) {
			router.push("/sign-in");
		}
	}, []);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		setIsLoading(true);
		const { error } = await supabase.client.auth.updateUser({ password });
		setIsLoading(false);

		setPassword("");
		setConfirmPassword("");

		if (error) {
			setErrorMessage(error.message);
			return;
		}

		setSuccess(true);
	}

	return (
		<Layout>
			<main className={`flex min-h-screen h-full w-full items-center justify-center`}>
				<div className="flex flex-col gap-8 items-center justify-center w-96">
					<h1 className={`text-4xl text-center`}>Set a new password</h1>
					<form onSubmit={handleSubmit} className="w-full">
						<Card className="w-full">
							<CardHeader>
								<CardTitle>Update Password</CardTitle>
								<CardDescription>Choose a strong password</CardDescription>
							</CardHeader>
							<CardContent className="flex flex-col gap-3">
								<Input
									required
									type="password"
									id="new-password"
									placeholder="New Password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
								<Input
									required
									type="password"
									id="new-password-confirm"
									placeholder="Confirm Password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
								/>
								{errorMessage && (
									<p className="text-red-500 text-sm flex items-center gap-2">
										<MaterialSymbol icon="error" size={20} weight={400} grade={400} />
										{errorMessage}
									</p>
								)}
								{success && (
									<p className="text-green-500 text-sm flex items-center gap-2">
										<MaterialSymbol icon="check_circle" size={20} weight={400} grade={400} />
										Password updated successfully
									</p>
								)}
							</CardContent>
							<CardFooter>
								<div className="flex flex-col w-full gap-4">
									<Button type="submit" className="w-full gap-2" disabled={isLoading}>
										{isLoading ? <Spinner className="opacity-50" /> : null}
										Update Password
									</Button>
								</div>
							</CardFooter>
						</Card>
					</form>
				</div>
			</main>
		</Layout>
	);
}
