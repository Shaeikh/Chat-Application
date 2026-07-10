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
    <FieldGroup className="max-w-sm">
      <Field>
        <InputGroup className="">
          <InputGroupTextarea
            id="inline-end-textarea"
            className="text-lg! "
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
              variant="default"
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

type MessageObjectType = {
  id: string | undefined;
  content: string;
  sentAt: number;
};

export default function App() {
  const [messageContent, setMessageContent] = useState<string | "">("");
  const [messages, setMessages] = useState<MessageObjectType[] | []>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const isMe: boolean = false;
  const handleSendMessage = () => {
    if (!messageContent.trim()) return;
    const messageObj: MessageObjectType = {
      id: socket.id,
      content: messageContent.trim(),
      sentAt: Date.now(),
    };
    socket.emit("send-message", messageObj);
    setMessageContent("");
  };

  useEffect(() => {
    if (!messageContent.trim()) {
      setIsTyping(false);
      return;
    }

    socket.emit("typing-message", socket.id);
  }, [messageContent]);

  useEffect(() => {
    const handleRecieveMessage = (message: MessageObjectType) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleTypingMessage = (socketID: string) => {
      setIsTyping(true);
    };

    socket.on("receive-message", handleRecieveMessage);
    socket.on("typing-message-received", handleTypingMessage);

    return () => {
      socket.off("receive-message", handleRecieveMessage);
      socket.off("typing-message-received", handleTypingMessage);
    };
  }, []);

  return (
    <>
      <div>
        <ModeToggle />
      </div>
      <div className="flex w-full max-w-sm flex-col gap-6 py-12 m-auto outline-2 p-3 rounded-xl">
        {messages.map((msg, index) => (
          <Message align={msg.id === socket.id ? "end" : "start"} key={index}>
            <MessageAvatar>
              <Avatar>
                <AvatarFallback>
                  {msg.id === socket.id ? "ME" : "U"}
                </AvatarFallback>
              </Avatar>
            </MessageAvatar>
            <MessageContent>
              <Bubble>
                <BubbleContent>{msg.content}</BubbleContent>
              </Bubble>
            </MessageContent>
          </Message>
        ))}
        {isTyping && (
          <Marker role="status">
            <MarkerContent className="shimmer">
              <span className="font-medium">{socket.id}</span> is typing...
            </MarkerContent>
          </Marker>
        )}
        {/* <Message align="end">
          <MessageAvatar>
            <Avatar>
              <AvatarImage src="/avatars/10.png" alt="@me" />
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
          </MessageAvatar>
          <MessageContent>
            <Bubble>
              <BubbleContent>Deploying to prod real quick.</BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
        <Message>
          <MessageAvatar>
            <Avatar>
              <AvatarImage src="/avatars/02.png" alt="@rabbit" />
              <AvatarFallback>R</AvatarFallback>
            </Avatar>
          </MessageAvatar>
          <MessageContent>
            <Bubble variant="muted">
              <BubbleContent>It's 4:45 PM. On Friday.</BubbleContent>
            </Bubble>
          </MessageContent>
        </Message>
        <Message align="end">
          <MessageAvatar>
            <Avatar>
              <AvatarImage src="/avatars/10.png" alt="@me" />
              <AvatarFallback>ME</AvatarFallback>
            </Avatar>
          </MessageAvatar>
          <MessageContent>
            <Bubble>
              <BubbleContent>It&apos;s a one-line change.</BubbleContent>
            </Bubble>
            <MessageFooter>Delivered</MessageFooter>
          </MessageContent>
        </Message>
        <Message>
          <MessageAvatar>
            <Avatar>
              <AvatarImage src="/avatars/02.png" alt="@rabbit" />
              <AvatarFallback>R</AvatarFallback>
            </Avatar>
          </MessageAvatar>
          <MessageContent>
            <BubbleGroup>
              <Bubble variant="muted">
                <BubbleContent>
                  It&apos;s always a one-line change 😭.
                </BubbleContent>
              </Bubble>
              <Bubble variant="muted">
                <BubbleContent>Alright, let me take a look.</BubbleContent>
                <BubbleReactions aria-label="Reactions: thumbs up">
                  <span>👍</span>
                </BubbleReactions>
              </Bubble>
            </BubbleGroup>
          </MessageContent>
        </Message> */}

        <MessageInput
          message={messageContent}
          onMessageChange={setMessageContent}
          onMessageSend={handleSendMessage}
        />
      </div>
    </>
  );
}
