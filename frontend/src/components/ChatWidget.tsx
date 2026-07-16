import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, User, Sparkles } from "lucide-react";
import { useSoundEffects } from "@/hooks/useSoundEffects";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatWidgetProps {
  paragraphs: string[];
  onChat: (
    message: string,
    onChunk?: (chunk: string) => void,
  ) => Promise<string>;
}

const ChatWidget = ({ paragraphs, onChat }: ChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I am your AI editing assistant. I can help you format, rewrite, or analyze your document. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { playSuccess, playStart } = useSoundEffects();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Prepare bot message for streaming
      const botMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: botMsgId,
          text: "",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);

      // Execute chat transmission with streaming callback
      await onChat(userMsg.text, (chunk) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botMsgId ? { ...m, text: m.text + chunk } : m,
          ),
        );
      });
    } catch (err) {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsTyping(false);
      playSuccess();
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex animate-fade-in flex-col items-start">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 flex h-[450px] w-[320px] flex-col overflow-hidden rounded-lg border border-primary/20 bg-slate-950/95 shadow-2xl backdrop-blur-sm duration-500 animate-in fade-in slide-in-from-bottom-4 sm:w-[380px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-primary/10 bg-primary/5 p-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-accent/40 bg-accent/20">
                  <Bot className="h-4 w-4 text-accent" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 animate-pulse rounded-full border-2 border-slate-950 bg-emerald-500" />
              </div>
              <div>
                <h3 className="font-tech text-[11px] uppercase tracking-[0.2em] text-primary">
                  Scribe AI
                </h3>
                <p className="font-mono text-[9px] uppercase text-accent/60">
                  Status: Online
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-primary/40 transition-colors hover:bg-white/5 hover:text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="scrollbar-hide flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-sm p-3 font-body text-[13px] leading-relaxed ${
                    msg.sender === "user"
                      ? "ml-4 border border-accent/20 bg-accent/10 text-foreground/90"
                      : "mr-4 border border-white/10 bg-white/5 text-primary/90"
                  } group relative`}
                >
                  {/* Decorative corner brackets for bot */}
                  {msg.sender === "bot" && (
                    <div className="absolute -left-1 -top-1 h-2 w-2 border-l border-t border-primary/40" />
                  )}
                  {msg.text}
                  <div
                    className={`mt-1 font-mono text-[8px] opacity-30 ${msg.sender === "user" ? "text-right" : "text-left"}`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-sm border border-white/10 bg-white/5 p-3">
                  <div className="h-1 w-1 animate-bounce rounded-full bg-primary/40" />
                  <div className="h-1 w-1 animate-bounce rounded-full bg-primary/40 [animation-delay:0.2s]" />
                  <div className="h-1 w-1 animate-bounce rounded-full bg-primary/40 [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-primary/10 bg-primary/5 p-3">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="w-full rounded-md border border-primary/20 bg-slate-900/50 py-2 pl-3 pr-10 font-mono text-[12px] text-primary transition-colors placeholder:text-primary/20 focus:border-accent/40 focus:outline-none"
              />
              <button
                onClick={handleSend}
                className="absolute right-2 p-1.5 text-accent transition-colors hover:text-primary"
                title="Send message"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) playStart();
        }}
        className={`group relative flex h-14 w-14 items-center justify-center rounded-full shadow-2xl transition-all duration-500 ${
          isOpen
            ? "rotate-90 border border-accent/40 bg-accent/20"
            : "border border-primary/30 bg-slate-950 hover:scale-110 hover:border-accent active:scale-95"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-accent/5 opacity-20" />
        {isOpen ? (
          <X className="h-6 w-6 text-primary" />
        ) : (
          <div className="relative">
            <MessageSquare className="h-6 w-6 text-primary transition-colors group-hover:text-accent" />
            <Sparkles className="absolute -right-1 -top-1 h-3 w-3 animate-pulse text-accent" />
          </div>
        )}

        {/* HUD Elements around button */}
        {!isOpen && (
          <div className="absolute inset-[-4px] animate-[spin_10s_linear_infinite] rounded-full border border-dashed border-primary/10" />
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
