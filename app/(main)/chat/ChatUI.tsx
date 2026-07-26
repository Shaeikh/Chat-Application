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

interface MessageInputProps {
  message: string | "";
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
}: MessageInputProps) {
  return (
    <FieldGroup className="max-w-lg">
      <Field>
        <InputGroup className="backdrop-blur-xl">
          <Input
            className="text-lg! px-4"
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
              className="ml-auto "
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

    const messageBody = isNormalMessage ? (
      <Message
        className={!sameAsPrevious ? "mt-6" : "mb-1"}
        align={user?.id === msg.user?.id ? "end" : "start"}
      >
        {!sameAsNext ? (
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
          {!sameAsPrevious ? (
            <MessageHeader>{msg.user?.name}</MessageHeader>
          ) : (
            <span />
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

export default function ChatUI({ serverSession }: ChatUIProps) {
  const [user, setUser] = useState<User>();
  const [messageContent, setMessageContent] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);
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

  useEffect(() => {
    setUser(sessionData.user);
  }, []);

  const loadRoomData = async () => {
    try {
      // const rooms = JSON.parse(localStorage.getItem("room-data") || "{}");
      // const data = rooms[currentRoom] ?? [];
      // setMessages(data.filter((e: MessageObject) => e.type !== "system"));
      if (currentRoom) {
        const response = await fetch("/api/chat/" + currentRoom);
        const data = (await response.json()) as Message[];
        setMessages(
          data.filter((message: Message) => message.type !== "system"),
        );
      } else {
        setMessages([]);
      }
    } catch (e) {
      alert(String(e));
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
          //   <div className="flex h-full flex-col mt-auto">

          //     <div className="flex w-full mt-auto max-h-full max-w-lg flex-col gap-6 mx-auto px-3 rounded-xl">
          <>
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-transparent mt-3"
            >
              <div className="max-w-lg mx-auto w-full justify-end flex flex-col min-h-full">
                <MessageContainer messages={messages} user={sessionData.user} />
                <div ref={messagesEndRef} />
              </div>
            </div>

            <div className="shrink-0 sticky bottom-0 border-none p-4 max-w-lg w-full mx-auto">
              <MessageInput
                message={messageContent}
                onMessageChange={setMessageContent}
                onMessageSend={handleSendMessage}
              />
            </div>
          </>
          //     </div>
          //   </div>
        )}
      </div>
    )
  );
}
