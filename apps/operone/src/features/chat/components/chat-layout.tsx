"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Settings, Copy, RefreshCw, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChatPromptInput } from "./chat-prompt-input";
import { ModelSelector } from "./model-selector";
import { useAI } from "@/contexts/ai-context";
import type { FileUIPart, ChatStatus } from "ai";

interface ChatLayoutProps {
  className?: string;
  showModelSelector?: boolean;
  showSidebar?: boolean;
}

export function ChatLayout({ 
  className, 
  showModelSelector = true, 
  showSidebar = true 
}: ChatLayoutProps) {
  const { 
    messages, 
    sendMessageStreaming, 
    isLoading, 
    streamingMessage, 
    activeProvider 
  } = useAI();
  
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [chatStatus, setChatStatus] = useState<ChatStatus>("idle" as ChatStatus);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, streamingMessage]);

  // Update chat status based on loading state
  useEffect(() => {
    if (isLoading) {
      setChatStatus("submitted");
    } else if (streamingMessage) {
      setChatStatus("streaming");
    } else {
      setChatStatus("idle" as ChatStatus);
    }
  }, [isLoading, streamingMessage]);

  const handleCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleRegenerate = async (messageId: string) => {
    // Find the message and regenerate response
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex > 0) {
      const userMessage = messages[messageIndex - 1];
      if (userMessage?.role === "user") {
        await sendMessageStreaming(userMessage.content);
      }
    }
  };

  const handleSubmit = async (message: { text: string; files: FileUIPart[] }) => {
    if (!message.text.trim()) return;
    
    setInput("");
    
    try {
      // Use streaming for better UX
      await sendMessageStreaming(message.text);
    } catch (error) {
      console.error("Failed to send message:", error);
      setChatStatus("error");
    }
  };

  const handleFeedback = async (messageId: string, feedback: "positive" | "negative") => {
    // Implement feedback logic
    console.log(`Feedback ${feedback} for message ${messageId}`);
  };

  // Transform messages to match the expected interface
  const transformedMessages = messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
  }));

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="border-b bg-muted/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Chat</h1>
                <p className="text-sm text-muted-foreground">
                  {activeProvider ? `Connected to ${activeProvider.type}` : "No provider selected"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {showModelSelector && (
                <ModelSelector
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                />
              )}
              
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        {showSidebar && (
          <div className="w-64 border-r bg-muted/20 hidden lg:block">
            {/* Sidebar content - chat history, settings, etc. */}
            <div className="p-4">
              <h3 className="text-sm font-semibold mb-3">Chat History</h3>
              <div className="space-y-2">
                {/* Placeholder for chat history */}
                <div className="text-sm text-muted-foreground">No previous chats</div>
              </div>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="max-w-4xl mx-auto px-4 py-6">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
                  <p className="text-muted-foreground mb-4">
                    Ask me anything! I'm here to help with your questions.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      "What can you help me with?",
                      "Explain quantum computing",
                      "Help me write code",
                      "Create a story"
                    ].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => setInput(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {transformedMessages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "group relative",
                        message.role === "user" ? "flex justify-end" : "flex justify-start"
                      )}
                      onMouseEnter={() => setHoveredMessage(message.id)}
                      onMouseLeave={() => setHoveredMessage(null)}
                    >
                      <div
                        className={cn(
                          "max-w-2xl rounded-full px-4 py-3 relative",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        )}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        
                        {/* Message actions */}
                        {hoveredMessage === message.id && (
                          <div className="absolute -top-8 right-0 flex gap-1 bg-background border rounded-full shadow-sm p-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(message.content, message.id)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            {message.role === "assistant" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRegenerate(message.id)}
                                >
                                  <RefreshCw className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFeedback(message.id, "positive")}
                                >
                                  <ThumbsUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFeedback(message.id, "negative")}
                                >
                                  <ThumbsDown className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                        
                        {copiedMessageId === message.id && (
                          <div className="absolute -top-8 right-0 text-xs bg-background border rounded px-2 py-1">
                            Copied!
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Loading indicator */}
                  {isLoading && !streamingMessage && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-4 py-3">
                        <div className="flex gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                          <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100" />
                          <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  )}
                
                {/* Streaming message */}
                {streamingMessage && (
                  <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-4 py-3 max-w-2xl">
                      <div className="whitespace-pre-wrap">{streamingMessage}</div>
                      <div className="w-2 h-4 bg-primary animate-pulse inline-block" />
                    </div>
                  </div>
                )}
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t bg-background/95 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto p-4">
              {/* Status bar */}
              <div className="flex items-center justify-between mb-3 px-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {activeProvider && (
                    <>
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span>Connected to {activeProvider.type}</span>
                      <span>•</span>
                      <span>Model: {selectedModel || "Default"}</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {messages.length} messages
                </div>
              </div>

              <ChatPromptInput
                input={input}
                setInput={setInput}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                onSubmit={handleSubmit}
                status={chatStatus}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
