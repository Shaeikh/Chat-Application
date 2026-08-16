import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import ChatUI from "./ChatUI";
import { Metadata } from "next";
import { pageMetadata } from "@/config/metadata";

export const metadata: Metadata = pageMetadata.chat;

export default async function ChatPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  return <ChatUI serverSession={session} />;
}
