import { MaterialSymbol } from "react-material-symbols";
import { Button } from "../ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function CreateMapDialog({ variant = "default" }: { variant?: "default" | "icon" }) {
	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
	}
	return (
		<Dialog>
			<DialogTrigger asChild>
				{variant === "icon" ? (
					<Button variant={"elevated"} size="icon">
						<MaterialSymbol icon="add" size={20} />
					</Button>
				) : (
					<Button variant={"secondary"}>Create new map</Button>
				)}
			</DialogTrigger>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create a new map</DialogTitle>
					<DialogDescription>What&apos;s the name of your new map?</DialogDescription>
				</DialogHeader>
				<form className="flex items-center space-x-2" onSubmit={handleSubmit}>
					<div className="grid flex-1 gap-2">
						<Label htmlFor="new-project-name" className="sr-only">
							Name
						</Label>
						<Input id="new-project-name" defaultValue="My new map 🗺" />
					</div>
					<Button type="submit" variant={"secondary"}>
						<MaterialSymbol icon="add" size={20} />
						Create
					</Button>
				</form>
			</DialogContent>
		</Dialog>
	);
}
