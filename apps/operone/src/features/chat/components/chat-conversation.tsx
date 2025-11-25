"use client";

import {
  Conversation,
  ConversationContent,
} from "@/components/ai/conversation";
import { Message, MessageContent } from "@/components/ai/message";

interface ChatConversationProps {
  messages: Array<{
    id: string;
    role: string;
    content: string;
  }>;
}

export function ChatConversation({ messages }: ChatConversationProps) {
  return (
    <Conversation>
      <ConversationContent>
        {messages.map((message) => (
          <Message from={message.role as "user" | "assistant" | "system"} key={message.id}>
            <MessageContent>{message.content}</MessageContent>
          </Message>
        ))}
      </ConversationContent>
    </Conversation>
  );
}
