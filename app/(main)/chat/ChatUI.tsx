"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bubble,
  BubbleContent,
  BubbleGroup,
  BubbleReactions,
} from "@/components/ui/bubble";
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker";
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

import { useEffect, useRef, useState, type UIEvent } from "react";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";
import { authClient } from "@/lib/auth-client";
import { v4 as uuidv4, v7 as uuidv7 } from "uuid";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ClipboardPasteIcon,
  CopyIcon,
  ScissorsIcon,
  TrashIcon,
} from "lucide-react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Badge } from "@/components/ui/badge";
import { flushSync } from "react-dom";
import { Spinner } from "@/components/ui/spinner";
import { MorphingRing } from "@/components/ui/morphing-ring";
import { TripleDotSpinner } from "@/components/ui/triple-dot-spinner";

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
  user: User;
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
  typingUsers: User[];
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
        <InputGroup className="">
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

function MessageContainer({
  messages,
  user,
  typingUsers,
}: MessageContainerProps) {
  interface Timestamps {
    messageID: string | undefined;
    time: string;
  }
  const [timestamps, setTimestamps] = useState<Timestamps>();
  const [focusedMessageId, setFocusedMessageId] = useState<string | undefined>(
    "",
  );

  let hoverTimer: any;
  const handleMouseEnterMessage = (message: Message) => {
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => {
      setTimestamps({
        messageID: message.id,
        time: new Date(message.createdAt).toLocaleTimeString(undefined, {
          timeStyle: "short",
        }),
      });
    }, 500);
  };

  const handleMouseLeaveMessage = () => {
    clearTimeout(hoverTimer);
    setTimestamps(undefined);
  };

  function copyText(text: string) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .catch((err) => console.error("Error copying:", err));
    }
  }

  function formatChatDate(date: Date) {
    const today = new Date();
    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";

    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
    });
  }
  const groups: {
    date: string;
    messages: Message[];
  }[] = [];

  for (const message of messages) {
    const date = formatChatDate(new Date(message.createdAt));

    const lastGroup = groups[groups.length - 1];

    if (!lastGroup || lastGroup.date !== date) {
      groups.push({
        date,
        messages: [message],
      });
    } else {
      lastGroup.messages.push(message);
    }
  }

  const container = groups.map((group) => (
    <div key={group.date}>
      <div className="sticky top-0 z-20 text-center">
        <Badge>{group.date}</Badge>
      </div>
      {group.messages.map((msg, index) => {
        const previous = messages[index - 1];
        const next = messages[index + 1];

        const sameAsPrevious = previous?.user?.id === msg?.user?.id;
        const sameAsNext = next?.user?.id === msg?.user?.id;
        const isNormalMessage = msg.type === "normal";

        const MAX_GAP = 5 * 60 * 1000; // 5 Minutes
        const nextGrouped =
          next &&
          next.user?.id === msg.user?.id &&
          new Date(next.createdAt).getTime() -
            new Date(msg.createdAt).getTime() <
            MAX_GAP;
        const previousGrouped =
          previous &&
          previous.user?.id === msg.user?.id &&
          new Date(previous.createdAt).getTime() -
            new Date(msg.createdAt).getTime() <
            MAX_GAP;

        const showAvatar = !nextGrouped;
        const showUsername = !previousGrouped;

        const isCurrentFocused = focusedMessageId === msg.id;
        const isAnyMessageFocused = focusedMessageId;

        const messageBody = isNormalMessage ? (
          <Message
            className={cn(
              "transition-all",
              sameAsPrevious ? "mt-1" : "mt-6",
              isCurrentFocused && "z-20 scale-[1.02]",
              isAnyMessageFocused &&
                !isCurrentFocused &&
                "blur-xs opacity-40 select-none cursor-default",
            )}
            align={user?.id === msg.user?.id ? "end" : "start"}
          >
            {showAvatar ? (
              <MessageAvatar>
                <Avatar>
                  {msg?.user?.image && (
                    <AvatarImage
                      src={`${msg.user?.image}`}
                      alt={msg.user?.name}
                    />
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

              <div
                className={cn(
                  "flex items-end gap-2",
                  user.id === msg.user.id ? "justify-end" : "justify-start",
                )}
              >
                {user.id === msg.user.id && (
                  <span
                    className={cn(
                      "text-[10px] text-muted-foreground whitespace-nowrap duration-400 transition-opacity ease-out",
                      timestamps?.messageID === msg.id
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  >
                    {timestamps?.messageID === msg.id ? timestamps?.time : ""}
                  </span>
                )}

                <Bubble
                  onMouseEnter={() => handleMouseEnterMessage(msg)}
                  onMouseLeave={handleMouseLeaveMessage}
                >
                  <ContextMenu
                    onOpenChange={(open) => {
                      if (open) setFocusedMessageId(msg.id);
                      else setFocusedMessageId("");
                    }}
                    // onOpenChangeComplete={() => handleContextMenu(msg.id)}
                  >
                    <BubbleContent
                      render={
                        <ContextMenuTrigger
                        // onContextMenu={(e) => {
                        //   e.preventDefault();
                        //   handleContextMenu(msg.id);
                        // }}
                        />
                      }
                    >
                      {msg.content}
                    </BubbleContent>
                    <ContextMenuContent>
                      <ContextMenuGroup>
                        <ContextMenuItem onClick={() => copyText(msg.content)}>
                          <CopyIcon />
                          Copy
                        </ContextMenuItem>
                        <ContextMenuItem>
                          <ScissorsIcon />
                          Cut
                        </ContextMenuItem>
                        <ContextMenuItem>
                          <ClipboardPasteIcon />
                          Paste
                        </ContextMenuItem>
                      </ContextMenuGroup>
                      <ContextMenuSeparator />
                      <ContextMenuGroup>
                        <ContextMenuItem
                          variant="destructive"
                          onClick={() => console.log(msg.content)}
                        >
                          <TrashIcon />
                          Delete
                        </ContextMenuItem>
                      </ContextMenuGroup>
                    </ContextMenuContent>
                  </ContextMenu>
                </Bubble>

                {user.id !== msg.user.id && (
                  <span
                    className={cn(
                      "text-[10px] text-muted-foreground whitespace-nowrap duration-400 transition-opacity ease-out",
                      timestamps?.messageID === msg.id
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  >
                    {timestamps?.messageID === msg.id ? timestamps?.time : ""}
                  </span>
                )}
              </div>
            </MessageContent>
          </Message>
        ) : (
          <div className="text-center">{msg.content}</div>
        );

        return (
          <div key={msg.id}>
            {/* {showDateSeparator && (
              <div className="text-center sticky top-0 z-50">
                <Badge>{formatChatDate(new Date(msg.createdAt))}</Badge>
              </div>
            )}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50">
              <Badge>{formatChatDate(new Date(msg.createdAt))}</Badge>
            </div> */}
            {messageBody}
          </div>
        );
      })}
    </div>
  ));

  return (
    <>
      {container}
      {typingUsers.length > 0 && (
        <Marker role="status">
          <MarkerContent className="shimmer">
            <span className="font-medium">
              {typingUsers.length < 4
                ? typingUsers.map((u) => u.name).join(", ")
                : "Several people"}
            </span>{" "}
            {typingUsers.length === 1 ? "is" : "are"} typing...
          </MarkerContent>
        </Marker>
      )}
    </>
  );
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
      <Message align="start">
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
  const [typingUsers, setTypingUsers] = useState<User[]>([]);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatLoaded, setChatLoaded] = useState<boolean>(false);
  const [loadingPrevMessages, setLoadingPrevMessages] = useState(false);
  const [allChatMessagesLoaded, setAllChatMessagesLoaded] = useState(false);

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
  }, [chatLoaded, messages, typingUsers]);
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
      id: uuidv7(),
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
      id: uuidv7(),
      content: `${sessionData?.user.name} has Joined the room`,
      createdAt: Date.now(),
    };
    socket.emit("room-joined", name);
    socket.emit("send-message", joinedRoomAlert);
  };

  useEffect(() => {
    loadRoomData();
    setAllChatMessagesLoaded(false);
  }, [currentRoom]);

  const loadRoomData = async () => {
    if (!currentRoom) {
      setMessages([]);
      return;
    }
    try {
      setChatError(null);
      setChatLoading(true);
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

  const loadPreviousMessages = async () => {
    const container = messagesContainerRef.current;
    const previousScrollHeight = container?.scrollHeight || 0;
    const response = await fetch(
      `/api/chat/${currentRoom}?before=${messages[0].id}`,
    );
    if (!response.ok) {
      throw new Error("Failed to load messages");
    }
    const data = (await response.json()) as Message[];

    if (data.length === 0) {
      setAllChatMessagesLoaded(true);
    }
    flushSync(() => {
      setMessages((prev) => [...data, ...prev]);
    });
    setLoadingPrevMessages(false);
    const newScrollHeight = container?.scrollHeight || 0;
    container!.scrollTop += newScrollHeight - previousScrollHeight;
  };

  useEffect(() => {
    const handleReceiveMessage = (message: Message) => {
      const room = message.room;
      setMessages((prev) => (room === currentRoom ? [...prev, message] : prev));
    };

    socket.on("receive-message", handleReceiveMessage);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
    };
  }, [currentRoom]);

  const isCurrentlyTypingRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const typingData = {
      roomID: currentRoom,
      user: sessionData.user,
      isTyping: true,
    };

    if (messageContent.trim()) {
      if (!isCurrentlyTypingRef.current) {
        isCurrentlyTypingRef.current = true;
        socket.emit("typing", typingData);
      }

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        isCurrentlyTypingRef.current = false;
        socket.emit("typing", { ...typingData, isTyping: false });
      }, 3000);
    } else {
      // If the user completely deletes their input text, stop typing immediately
      if (isCurrentlyTypingRef.current) {
        isCurrentlyTypingRef.current = false;
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        socket.emit("typing", { ...typingData, isTyping: false });
      }
    }
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [messageContent, currentRoom, sessionData.user]);

  useEffect(() => {
    const handleUserTyping = (typingData: any) => {
      if (typingData.user.id === sessionData.user.id) return;

      if (typingData.isTyping) {
        setTypingUsers((prev) => {
          if (prev.some((u) => u.id === typingData.user.id)) {
            return prev;
          }

          return [...prev, typingData.user];
        });
      } else {
        setTypingUsers((prev) =>
          prev.filter((user) => user.id !== typingData.user.id),
        );
      }
    };

    socket.on("user-typing", handleUserTyping);

    return () => {
      socket.off("user-typing", handleUserTyping);
    };
  }, [sessionData.user.id]);

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
              key={currentRoom} // so the states go back to default the second the room is changed
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-4 scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-transparent mt-3"
              onScroll={(e) => {
                if (
                  e.currentTarget.scrollTop <= 100 &&
                  !loadingPrevMessages &&
                  !allChatMessagesLoaded
                ) {
                  setLoadingPrevMessages(true);
                  loadPreviousMessages();
                  setTimeout(() => {}, 5000);
                }
              }}
            >
              <div className="max-w-lg mx-auto w-full justify-end flex flex-col min-h-full">
                {loadingPrevMessages && (
                  <div className="mt-3 mb-5 mx-auto">
                    <TripleDotSpinner />
                  </div>
                )}
                {chatLoading ? (
                  <MessageSkeleton />
                ) : chatError ? (
                  <div>{chatError}</div>
                ) : (
                  <MessageContainer
                    typingUsers={typingUsers}
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
