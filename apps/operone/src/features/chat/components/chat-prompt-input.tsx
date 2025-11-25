"use client";

import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputSelect,
  PromptInputSelectTrigger,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectValue,
} from "@/components/ai/prompt-input";
import type { FileUIPart, ChatStatus } from "ai";
import { MicIcon, PaperclipIcon } from "lucide-react";

const models = [
  { id: "gpt-4o", name: "GPT-4o" },
  { id: "claude-3-5-sonnet-20241022", name: "Claude 3.5 Sonnet" },
];

interface ChatPromptInputProps {
  input: string;
  setInput: (value: string) => void;
  selectedModel: string;
  setSelectedModel: (value: string) => void;
  onSubmit: (message: { text: string; files: FileUIPart[] }, event: React.FormEvent<HTMLFormElement>) => void;
  status: ChatStatus;
}

export function ChatPromptInput({
  input,
  setInput,
  selectedModel,
  setSelectedModel,
  onSubmit,
  status,
}: ChatPromptInputProps) {
  return (
    <PromptInput onSubmit={onSubmit}>
      <PromptInputTextarea
        value={input}
        onChange={(e) => setInput(e.currentTarget.value)}
        placeholder="Type your message..."
      />
      <PromptInputFooter>
        <PromptInputTools>
          <PromptInputButton>
            <PaperclipIcon size={16} />
          </PromptInputButton>
          <PromptInputButton>
            <MicIcon size={16} />
            <span>Voice</span>
          </PromptInputButton>
          <PromptInputSelect
            value={selectedModel}
            onValueChange={setSelectedModel}
          >
            <PromptInputSelectTrigger>
              <PromptInputSelectValue />
            </PromptInputSelectTrigger>
            <PromptInputSelectContent>
              {models.map((model) => (
                <PromptInputSelectItem key={model.id} value={model.id}>
                  {model.name}
                </PromptInputSelectItem>
              ))}
            </PromptInputSelectContent>
          </PromptInputSelect>
        </PromptInputTools>
        <PromptInputSubmit disabled={!input.trim()} status={status} />
      </PromptInputFooter>
    </PromptInput>
  );
}
