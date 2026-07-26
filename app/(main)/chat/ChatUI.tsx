"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
} from "@/components/ui/bubble";
import { Marker, MarkerContent } from "@/components/ui/marker";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/components/ui/message";
import { ModeToggle } from "@/components/ModeToggle";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";
import { authClient } from "@/lib/auth-client";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface MessageInputProps {
  message: string | "";
  disabled?: boolean;
  onMessageChange: (message: string | "") => void;
  onMessageSend: () => void;
}

interface RoomProps {
  name: string;
  onRoomChange: (name: string) => void;
  onRoomJoin: (name: string) => void;
}

type Message = {
  user?: User;
  room: string;
  type: "normal" | "system";
  id: string | undefined;
  content: string;
  createdAt: number;
};

interface User {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  emailVerified: boolean;
  name: string;
  image?: string | null | undefined;
}

interface MessageContainerProps {
  messages: Message[];
  user: User;
}

interface ChatUIProps {
  serverSession: typeof authClient.$Infer.Session;
}

export function MessageInput({
  message,
  onMessageChange,
  onMessageSend,
  disabled = true,
}: MessageInputProps) {
  return (
    <FieldGroup className="max-w-lg">
      <Field>
        <InputGroup className="backdrop-blur-xl">
          <Input
            disabled={disabled}
            className="text-lg! px-4 disabled:cursor-not-allowed disabled:pointer-events-auto"
            placeholder="Write a message"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onMessageSend();
              }
            }}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              onClick={onMessageSend}
              variant="secondary"
              size="sm"
              className="ml-auto disabled:cursor-not-allowed disabled:hover:bg-secondary disabled:pointer-events-auto"
              disabled={disabled}
            >
              Send
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </Field>
    </FieldGroup>
  );
}

function Room({ name, onRoomChange, onRoomJoin }: RoomProps) {
  function onClick() {
    onRoomChange(name);
    onRoomJoin(name);
  }
  return (
    <div>
      <Button onClick={onClick}>{name}</Button>
    </div>
  );
}

function MessageContainer({ messages, user }: MessageContainerProps) {
  const container = messages.map((msg, index) => {
    const previous = messages[index - 1];
    const next = messages[index + 1];

    const sameAsPrevious = previous?.user?.id === msg?.user?.id;
    const sameAsNext = next?.user?.id === msg?.user?.id;
    const isNormalMessage = msg.type === "normal";

    const MAX_GAP = 5 * 60 * 1000; // 5 Minutes
    const nextGrouped =
      next &&
      next.user?.id === msg.user?.id &&
      new Date(next.createdAt).getTime() - new Date(msg.createdAt).getTime() <
        MAX_GAP;
    const previousGrouped =
      previous &&
      previous.user?.id === msg.user?.id &&
      new Date(previous.createdAt).getTime() -
        new Date(msg.createdAt).getTime() <
        MAX_GAP;

    const showAvatar = !nextGrouped;
    const showUsername = !previousGrouped;

    const messageBody = isNormalMessage ? (
      <Message
        className={cn("transition-all", sameAsPrevious ? "mt-1" : "mt-6")}
        align={user?.id === msg.user?.id ? "end" : "start"}
      >
        {showAvatar ? (
          <MessageAvatar>
            <Avatar>
              {msg?.user?.image && (
                <AvatarImage src={`${msg.user?.image}`} alt={msg.user?.name} />
              )}
              <AvatarFallback>{msg.user?.name?.slice(0, 2)}</AvatarFallback>
            </Avatar>
          </MessageAvatar>
        ) : (
          <MessageAvatar />
        )}

        <MessageContent>
          {showUsername ? (
            <MessageHeader>{msg.user?.name}</MessageHeader>
          ) : (
            <div className="w-10 shrink-0" />
          )}

          <Bubble>
            <BubbleContent>{msg.content}</BubbleContent>
          </Bubble>
          {/* <MessageFooter>Delivered</MessageFooter> */}
        </MessageContent>
      </Message>
    ) : (
      <div className="text-center">{msg.content}</div>
    );

    return <div key={msg.id}>{messageBody}</div>;
  });
  return <>{container}</>;
}

function MessageSkeleton() {
  return (
    <>
      <Message align="end">
        <MessageAvatar>
          <Skeleton className="h-9 w-9 shrink-0 rounded-full self-end group-has-data-[slot=message-footer]/message:-translate-y-8" />
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>
            <Skeleton className="ml-2 h-[10.75] w-10" />
          </MessageHeader>
          <Bubble>
            <Skeleton className="h-10.75 rounded-3xl w-40" />
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="start">
        <MessageAvatar>
          <Skeleton className="h-9 w-9 rounded-full" />
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>
            <Skeleton className="h-[10.75] w-10" />
          </MessageHeader>
          <Bubble>
            <Skeleton className="h-10.75 rounded-3xl w-30" />
          </Bubble>
        </MessageContent>
      </Message>

      <Message align="end">
        <MessageAvatar>
          <Skeleton className="h-9 w-9 shrink-0 rounded-full self-end group-has-data-[slot=message-footer]/message:-translate-y-8" />
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>
            <Skeleton className="ml-2 h-[10.75] w-10" />
          </MessageHeader>
          <Bubble>
            <Skeleton className="h-10.75 rounded-3xl w-60" />
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="start">
        <MessageAvatar>
          <Skeleton className="h-9 w-9 shrink-0 rounded-full self-end group-has-data-[slot=message-footer]/message:-translate-y-8" />
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>
            <Skeleton className="h-[10.75] w-10" />
          </MessageHeader>
          <Bubble>
            <Skeleton className="h-21.5 rounded-3xl w-80" />
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar />
        <MessageContent>
          <MessageHeader>
            <Skeleton className="ml-2 h-[10.75] w-10" />
          </MessageHeader>
          <Bubble>
            <Skeleton className="h-10.75 rounded-3xl w-60" />
          </Bubble>
        </MessageContent>
      </Message>
      <Message align="end">
        <MessageAvatar>
          <Skeleton className="h-9 w-9 shrink-0 rounded-full self-end group-has-data-[slot=message-footer]/message:-translate-y-8" />
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>
            <div className="mt-2" />
          </MessageHeader>
          <Bubble>
            <Skeleton className="h-10.75 rounded-3xl w-60" />
          </Bubble>
        </MessageContent>
      </Message>
    </>
  );
}

export default function ChatUI({ serverSession }: ChatUIProps) {
  const [user, setUser] = useState<User>();
  const [messageContent, setMessageContent] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string>("");
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatLoaded, setChatLoaded] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (chatLoaded) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "instant",
      });
    } else {
      messagesEndRef?.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [chatLoaded, messages]);

  useEffect(() => {}, [messages]);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   const container = messagesContainerRef.current;

  //   if (container) {
  //     container.scrollTop = container.scrollHeight;
  //   }
  // }, [messages]);

  //   const sessionData = isPending ? serverSession : session;
  const sessionData = serverSession;

  const handleSendMessage = () => {
    if (!messageContent.trim()) return;
    const messageObj: Message = {
      user: sessionData?.user,
      room: currentRoom,
      type: "normal",
      id: uuidv4(),
      content: messageContent.trim(),
      createdAt: Date.now(),
    };
    socket.emit("send-message", messageObj);
    setMessageContent("");
  };

  const handleRoomJoin = (name: string) => {
    if (!name.trim()) return;

    const joinedRoomAlert = {
      user: "System",
      room: name,
      type: "system",
      id: uuidv4(),
      content: `${sessionData?.user.name} has Joined the room`,
      createdAt: Date.now(),
    };
    socket.emit("room-joined", name);
    socket.emit("send-message", joinedRoomAlert);
  };

  useEffect(() => {
    loadRoomData();
  }, [currentRoom]);

  const loadRoomData = async () => {
    if (!currentRoom) {
      setMessages([]);
      return;
    }
    try {
      setChatError(null);

      const response = await fetch(`/api/chat/${currentRoom}`);
      if (!response.ok) {
        throw new Error("Failed to load messages");
      }
      const data = (await response.json()) as Message[];
      setMessages(data.filter((message: Message) => message.type !== "system"));
      setChatLoaded(true);
    } catch (e) {
      setChatError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setChatLoading(false);
      setTimeout(() => {
        setChatLoaded(false);
      }, 500);
    }
  };

  useEffect(() => {
    const handleReceiveMessage = (message: Message) => {
      const room = message.room;

      // const existingRoomData = JSON.parse(
      //   localStorage.getItem("room-data") || "{}",
      // );

      // if (!existingRoomData[room]) {
      //   existingRoomData[room] = [];
      // }

      // if (message.type !== "system") existingRoomData[room].push(message);

      // localStorage.setItem("room-data", JSON.stringify(existingRoomData));
      setMessages((prev) => (room === currentRoom ? [...prev, message] : prev));
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [currentRoom]);

  return (
    sessionData && (
      <div className="h-screen flex flex-col">
        <div className="absolute">
          <ModeToggle />

          {sessionData.user && (
            <>
              <Room
                name="Room 1"
                onRoomChange={setCurrentRoom}
                onRoomJoin={handleRoomJoin}
              />
              <Room
                name="Room 2"
                onRoomChange={setCurrentRoom}
                onRoomJoin={handleRoomJoin}
              />
              <p className="top-20 left-2 z-50 bg-black text-white">
                {currentRoom}
              </p>
            </>
          )}
        </div>
        {currentRoom && sessionData.user && (
          <>
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-transparent mt-3"
            >
              <div className="max-w-lg mx-auto w-full justify-end flex flex-col min-h-full">
                {chatLoading ? (
                  <MessageSkeleton />
                ) : chatError ? (
                  <div>{chatError}</div>
                ) : (
                  <MessageContainer
                    messages={messages}
                    user={sessionData.user}
                  />
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="shrink-0 sticky bottom-0 border-none p-3 max-w-lg w-full mx-auto">
              <MessageInput
                message={messageContent}
                onMessageChange={setMessageContent}
                onMessageSend={handleSendMessage}
                disabled={chatLoading}
              />
            </div>
          </>
        )}
      </div>
    )
  );
}
