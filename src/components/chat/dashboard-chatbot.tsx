"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bot, X, Send, Loader2, Sparkles, RotateCcw } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "¿Cuántos jugadores VIP tenemos?",
  "Resume la actividad de esta semana",
  "¿Cómo van las campañas activas?",
  "¿Quiénes son los top spenders?",
  "¿Cuál es la ocupación media?",
  "Analiza las tendencias de revenue",
];

export function DashboardChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: "",
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const allMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(
          errData?.error || `Error ${res.status}: ${res.statusText}`
        );
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No se pudo leer la respuesta");

      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id ? { ...m, content: fullText } : m
          )
        );
      }

      // If no content came through, show a fallback
      if (!fullText.trim()) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, content: "No pude generar una respuesta. Inténtalo de nuevo." }
              : m
          )
        );
      }
    } catch (err: any) {
      setError(err.message || "Error de conexión");
      // Remove the empty assistant message on error
      setMessages((prev) =>
        prev.filter((m) => m.id !== assistantMessage.id)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
          title="Caddie AI — Asistente inteligente"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex w-[400px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border bg-background shadow-2xl"
          style={{ height: "min(600px, calc(100vh - 6rem))" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3 rounded-t-2xl bg-primary/5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold leading-none">
                  Caddie AI
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Asistente con datos en tiempo real
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  onClick={resetChat}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  title="Nueva conversación"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center h-full text-center px-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium mb-1">
                  ¡Hola! Soy Caddie AI
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Tengo acceso a todos los datos del CRM. Pregúntame lo que
                  necesites sobre jugadores, campañas, torneos, meteorología o
                  revenue.
                </p>
                <div className="grid grid-cols-2 gap-2 w-full">
                  {SUGGESTIONS.slice(0, 4).map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => sendMessage(suggestion)}
                      className="rounded-lg border px-3 py-2 text-left text-[11px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors leading-snug"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  }`}
                >
                  {message.role === "assistant" && !message.content && isLoading ? (
                    <div className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span className="text-xs text-muted-foreground">
                        Consultando datos...
                      </span>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap break-words">
                      {formatMarkdown(message.content)}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {error && (
              <div className="mx-auto max-w-[90%] rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive text-center">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pregunta sobre tus datos..."
                disabled={isLoading}
                rows={1}
                className="flex-1 resize-none rounded-xl border bg-muted/50 px-3.5 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 max-h-[100px]"
                style={{ minHeight: "40px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "40px";
                  target.style.height = Math.min(target.scrollHeight, 100) + "px";
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-1.5">
              Caddie AI consulta datos reales del CRM en cada pregunta
            </p>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Simple markdown formatting for bold and lists
 */
function formatMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    // Bold text: **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const formattedParts = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={j} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    if (i > 0) {
      elements.push(<br key={`br-${i}`} />);
    }
    elements.push(<span key={`line-${i}`}>{formattedParts}</span>);
  });

  return elements;
}
