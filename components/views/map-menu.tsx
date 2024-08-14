import { MaterialSymbol } from "react-material-symbols";
import { Button } from "../ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";
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
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export function MapMenu() {
	return (
		<>
			<Dialog>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant={"elevated"} size={"icon"}>
							<MaterialSymbol icon="more_horiz" size={20} />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className="w-56" align="start" side="right" sideOffset={20} alignOffset={-13}>
						<DialogTrigger asChild>
							<DropdownMenuItem className="gap-2 items-center">
								<MaterialSymbol icon="share" size={16} className="" />
								Share
							</DropdownMenuItem>
						</DialogTrigger>
						<DropdownMenuItem className="gap-2 items-center">
							<MaterialSymbol icon="file_copy" size={16} className="" />
							Duplicate
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DialogTrigger asChild>
							<DropdownMenuItem className="gap-2 items-center text-red-500 hover:!text-red-500">
								<MaterialSymbol icon="delete" size={16} className="" />
								Delete
							</DropdownMenuItem>
						</DialogTrigger>
					</DropdownMenuContent>
				</DropdownMenu>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Share link</DialogTitle>
						<DialogDescription>Anyone who has this link will be able to view this.</DialogDescription>
					</DialogHeader>
					<div className="flex items-center space-x-2">
						<div className="grid flex-1 gap-2">
							<Label htmlFor="link" className="sr-only">
								Link
							</Label>
							<Input id="link" defaultValue="https://ui.shadcn.com/docs/installation" readOnly />
						</div>
						<Button type="submit" size="sm" className="px-3">
							<span className="sr-only">Copy</span>
							<MaterialSymbol icon="content_copy" size={20} />
						</Button>
					</div>
					<DialogFooter className="sm:justify-start">
						<DialogClose asChild>
							<Button type="button" variant="secondary">
								Close
							</Button>
						</DialogClose>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
