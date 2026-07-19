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

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";
import { authClient } from "@/lib/auth-client";
import { generateRandomString } from "@/utils/generateRandomString";
import { router } from "better-auth/api";
import { Spinner } from "@/components/ui/spinner";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

interface MessageInputProps {
  message: string | "";
  onMessageChange: (message: string | "") => void;
  onMessageSend: () => void;
}

export function MessageInput({
  message,
  onMessageChange,
  onMessageSend,
}: MessageInputProps) {
  return (
    <FieldGroup className="max-w-lg">
      <Field>
        <InputGroup className="">
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

interface UserInputFieldProps {
  username: string;
  onUsernameChange: (username: string) => void;
  onUsernameConfirm: () => void;
}

function UserInputField({
  username,
  onUsernameChange,
  onUsernameConfirm,
}: UserInputFieldProps) {
  return (
    <>
      <Field className="max-w-sm m-auto">
        <FieldLabel htmlFor="input-field-username">Username</FieldLabel>
        <Input
          id="input-field-username"
          className="bg-input/50 h-10"
          type="text"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onUsernameConfirm();
            }
          }}
        />
        <FieldDescription>
          Choose a unique username for your account.
        </FieldDescription>
        <InputGroupButton
          onClick={onUsernameConfirm}
          variant="default"
          size="sm"
          className=""
        >
          Confirm
        </InputGroupButton>
      </Field>
    </>
  );
}

interface RoomProps {
  name: string;
  onRoomChange: (name: string) => void;
  onRoomJoin: (name: string) => void;
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

type MessageObjectType = {
  user?: User;
  room: string;
  type: "normal" | "system";
  id: string | undefined;
  content: string;
  createdAt: number;
};

interface User {
  username: string;
  id: string;
  createdAt: number;
}

export default function Chat() {
  const router = useRouter();
  const [username, setUsername] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<User>();
  const [users, setUsers] = useState<User[]>([]);
  const [messageContent, setMessageContent] = useState<string>("");
  const [messages, setMessages] = useState<MessageObjectType[]>([]);

  const [currentRoom, setCurrentRoom] = useState<string>("");

  const { data: sessionData, isPending, error } = authClient.useSession();

  // const [roomData, setRoomData] = useState<MessageObjectType[]>([]);

  //   const handleUserCreation = () => {
  //     const newUser: User = {
  //       username: username,
  //       id: generateRandomString(8),
  //       createdAt: Date.now(),
  //     };
  //     setUsers((prev) => [...prev, newUser]);
  //     setCurrentUser(newUser);
  //     socket.emit("user-created", newUser);
  //   };

  const handleSendMessage = () => {
    if (!messageContent.trim()) return;
    const messageObj: MessageObjectType = {
      user: currentUser,
      room: currentRoom,
      type: "normal",
      id: generateRandomString(5),
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
      id: generateRandomString(10),
      content: `${sessionData?.user.name} has Joined the room`,
      createdAt: Date.now(),
    };
    socket.emit("room-joined", name);
    socket.emit("send-message", joinedRoomAlert);
  };

  useEffect(() => {
    loadRoomData();
  }, [currentRoom]);

  const loadRoomData = () => {
    const rooms = JSON.parse(localStorage.getItem("room-data") || "{}");
    const data = rooms[currentRoom] ?? [];

    // setRoomData(data);
    setMessages(
      data.filter((e: MessageObjectType) => e.type.toLowerCase() !== "system"),
    );
  };

  useEffect(() => {
    const handleReceiveMessage = (message: MessageObjectType) => {
      const room = message.room;

      const existingRoomData = JSON.parse(
        localStorage.getItem("room-data") || "{}",
      );

      if (!existingRoomData[room]) {
        existingRoomData[room] = [];
      }

      if (message.type !== "system") existingRoomData[room].push(message);

      localStorage.setItem("room-data", JSON.stringify(existingRoomData));
      setMessages((prev) => (room === currentRoom ? [...prev, message] : prev));
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [currentRoom]);

  useEffect(() => {
    console.log(sessionData);
    // if (!sessionData) router.push("/login");
  }, [sessionData]);

  if (isPending) {
    return (
      <>
        <div className="m-auto">
          <Spinner className="mx-auto w-full mb-5" />
          {error && (
            <p className="text-xl">
              Couldn't load your chats. Please check your connection and try
              again.
            </p>
          )}
        </div>
      </>
    );
  }

  return (
    sessionData && (
      <div className="h-full flex flex-1 flex-col">
        <div>
          <ModeToggle />
        </div>

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
          </>
        )}
        {currentRoom && sessionData.user && (
          <div className="flex h-full flex-col mt-auto mb-4">
            <div className="flex w-full mt-auto max-h-full max-w-lg flex-col gap-6 m-auto p-3 rounded-xl">
              {messages.map((msg, index) =>
                msg.type === "normal" ? (
                  <Message
                    align={currentUser?.id === msg.user?.id ? "end" : "start"}
                    key={msg.id}
                  >
                    <MessageAvatar>
                      <Avatar>
                        <AvatarFallback>
                          {msg.user?.username.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </MessageAvatar>
                    <MessageContent>
                      <Bubble>
                        <BubbleContent>{msg.content}</BubbleContent>
                      </Bubble>
                    </MessageContent>
                  </Message>
                ) : (
                  <div key={index} className="text-center">
                    {msg.content}
                  </div>
                ),
              )}

              {/* 
        {isTyping && (
          <Marker role="status">
            <MarkerContent className="shimmer">
              <span className="font-medium">{socket.id}</span> is typing...
            </MarkerContent>
          </Marker>
        )} */}

              <MessageInput
                message={messageContent}
                onMessageChange={setMessageContent}
                onMessageSend={handleSendMessage}
              />
            </div>
          </div>
        )}
      </div>
    )
  );
}
