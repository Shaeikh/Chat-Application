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

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";
import { generateRandomString } from "@/utils/generateRandomString";
import { Button } from "@/components/ui/button";

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
      {/* <FieldGroup className="max-w-sm">
        <Field>
          <InputGroup className="">
            <InputGroupTextarea
              id="inline-end-textarea"
              className="text-xl!"
              placeholder="Enter your Username"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onUsernameConfirm();
                }
              }}
            />
          </InputGroup>
          <InputGroupButton
            onClick={onUsernameConfirm}
            variant="default"
            size="sm"
            className=""
          >
            Confirm
          </InputGroupButton>
        </Field>
      </FieldGroup> */}
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

export default function App() {
  const [username, setUsername] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<User>();
  const [users, setUsers] = useState<User[]>([]);
  const [messageContent, setMessageContent] = useState<string | "">("");
  const [messages, setMessages] = useState<MessageObjectType[] | []>([]);

  const [currentRoom, setCurrentRoom] = useState<string>("");
  // const [typing, setTyping] = useState<string[]>([]);
  // const [isTyping, setIsTyping] = useState<boolean>(false);

  const handleUserCreation = () => {
    const newUser: User = {
      username: username,
      id: generateRandomString(8),
      createdAt: Date.now(),
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentUser(newUser);
    socket.emit("user-created", newUser);
  };

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
    socket.emit("room-joined", name);
    socket.emit("send-message", {
      user: "System",
      room: name,
      type: "system",
      id: generateRandomString(10),
      content: `${currentUser?.username} has Joined the room`,
      createdAt: Date.now(),
    });
  };

  // useEffect(() => {
  //   if (!messageContent.trim()) return;

  //   socket.emit("typing-send", socket.id);
  // }, [messageContent]);

  useEffect(() => {
    const handleRecieveMessage = (message: MessageObjectType) => {
      console.log(message);
      setMessages((prev) => [...prev, message]);
    };

    // const handleTyping = (socketID: string) => {
    //   setTyping((prev) => [...prev, socketID]);
    //   setIsTyping(true);
    // };

    // const handleTypingStop = () => {
    //   setIsTyping(false);
    // };

    socket.on("receive-message", handleRecieveMessage);
    // socket.on("typing-received", handleTyping);
    // socket.on("typing-stop-recieved", handleTypingStop);

    return () => {
      socket.off("receive-message", handleRecieveMessage);
      // socket.off("typing-received", handleTyping);
      // socket.off("typing-stop-recieved", handleTypingStop);
    };
  }, []);

  return (
    <div className="h-full flex flex-1 flex-col">
      <div>
        <ModeToggle />
      </div>
      {!currentUser && (
        <div className="my-auto">
          <UserInputField
            username={username}
            onUsernameChange={setUsername}
            onUsernameConfirm={handleUserCreation}
          />
        </div>
      )}
      {currentUser && (
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
      {currentRoom && currentUser && (
        <div className="flex h-full flex-col mt-auto mb-4">
          <div className="flex w-full mt-auto max-h-full max-w-lg flex-col gap-6 m-auto p-3 rounded-xl">
            {messages.map((msg) =>
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
                <div key={msg.id} className="text-center">
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
  );
}
