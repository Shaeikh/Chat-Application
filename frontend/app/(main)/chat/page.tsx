import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import ChatUI from "./ChatUI";

export default async function ChatPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return null;
  }

  return <ChatUI serverSession={session} />;
}
