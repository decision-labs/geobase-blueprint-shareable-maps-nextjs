import { useContext, useEffect, useState } from "react";
import { SupabaseContext } from "./supabase-provider";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";

export function Layout({ children }: { children: React.ReactNode }) {
	return <main className={`flex min-h-screen h-full w-full relative`}>{children}</main>;
}
