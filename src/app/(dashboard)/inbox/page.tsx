"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare,
  Search,
  Bot,
  Send,
  Paperclip,
  Smile,
  Sparkles,
  MoreVertical,
  Phone,
  Check,
  CheckCheck,
  ArrowLeft,
  Loader2,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Conversation {
  id: string;
  status: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCount: number;
  currentSentiment: string | null;
  isAiBotActive: boolean;
  player: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    avatarUrl: string | null;
    engagementLevel: string;
  };
  assignedTo: { id: string; name: string } | null;
}

interface Message {
  id: string;
  direction: string;
  type: string;
  content: string;
  status: string;
  timestamp: string;
  sentBy: string | null;
  isAiGenerated: boolean;
  templateName: string | null;
  mediaUrl: string | null;
}

const sentimentColors: Record<string, string> = {
  POSITIVE: "bg-green-500",
  NEUTRAL: "bg-gray-400",
  NEGATIVE: "bg-red-500",
  FRUSTRATED: "bg-red-700",
};

const sentimentLabels: Record<string, string> = {
  POSITIVE: "Positivo",
  NEUTRAL: "Neutral",
  NEGATIVE: "Negativo",
  FRUSTRATED: "Frustrado",
};

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "SENT":
      return <Check className="h-3 w-3" />;
    case "DELIVERED":
      return <CheckCheck className="h-3 w-3" />;
    case "READ":
      return <CheckCheck className="h-3 w-3 text-blue-400" />;
    case "FAILED":
      return <XCircle className="h-3 w-3 text-red-400" />;
    case "PENDING":
      return <Clock className="h-3 w-3" />;
    default:
      return null;
  }
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffMin < 1440) {
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

function formatMessageTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch {
      // Silently fail on poll errors
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load + polling
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Load messages when conversation selected
  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    setSendError(null);

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/conversations/${selectedId}/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch {
        // ignore
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();

    // Mark as read
    fetch(`/api/conversations/${selectedId}/read`, { method: "POST" }).catch(
      () => {}
    );

    // Poll messages every 3 seconds when viewing a conversation
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  const filteredConversations = searchQuery
    ? conversations.filter(
        (c) =>
          `${c.player.firstName} ${c.player.lastName}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (c.lastMessagePreview || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    : conversations;

  const handleBack = () => {
    setSelectedId(null);
    setShowActions(false);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedId || sending) return;

    setSending(true);
    setSendError(null);

    try {
      const res = await fetch(`/api/conversations/${selectedId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageInput, type: "TEXT" }),
      });

      if (res.ok) {
        setMessageInput("");
        // Refresh messages and conversations
        const msgRes = await fetch(
          `/api/conversations/${selectedId}/messages`
        );
        if (msgRes.ok) {
          const data = await msgRes.json();
          setMessages(data.messages || []);
        }
        fetchConversations();
      } else {
        const data = await res.json();
        setSendError(data.error || "Error al enviar");
      }
    } catch {
      setSendError("Error de conexión");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUpdateConversation = async (
    field: string,
    value: string | boolean
  ) => {
    if (!selectedId) return;
    try {
      await fetch(`/api/conversations/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      fetchConversations();
      setShowActions(false);
    } catch {
      // ignore
    }
  };

  // Check if 24h window is expired (can only send templates outside window)
  const lastInboundMessage = messages
    .filter((m) => m.direction === "INBOUND")
    .at(-1);
  const is24hExpired = lastInboundMessage
    ? Date.now() - new Date(lastInboundMessage.timestamp).getTime() >
      24 * 60 * 60 * 1000
    : true;

  return (
    <div className="flex h-[calc(100vh-7rem)] -m-4 sm:-m-6">
      {/* Conversation list */}
      <div
        className={`${
          selectedId ? "hidden md:flex" : "flex"
        } w-full md:w-80 md:min-w-[320px] border-r flex-col bg-background`}
      >
        <div className="p-3 sm:p-4 border-b">
          <h2 className="font-semibold mb-3">Bandeja de Entrada</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar conversaciones..."
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">
                {searchQuery
                  ? "Sin resultados"
                  : "No hay conversaciones aún"}
              </p>
              {!searchQuery && (
                <p className="text-xs mt-1">
                  Los mensajes de WhatsApp aparecerán aquí
                </p>
              )}
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedId(conv.id)}
                className={`w-full text-left p-3 sm:p-4 border-b hover:bg-muted/50 transition-colors ${
                  selectedId === conv.id ? "bg-muted" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {conv.player.firstName[0]}
                        {conv.player.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    {conv.currentSentiment && (
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${
                          sentimentColors[conv.currentSentiment] || "bg-gray-400"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">
                        {conv.player.firstName} {conv.player.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground shrink-0 ml-2">
                        {conv.lastMessageAt
                          ? formatTime(conv.lastMessageAt)
                          : ""}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {conv.lastMessagePreview || "Sin mensajes"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {conv.isAiBotActive && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-4 px-1"
                        >
                          <Bot className="h-2.5 w-2.5 mr-0.5" />
                          IA
                        </Badge>
                      )}
                      {conv.unreadCount > 0 && (
                        <Badge className="text-[10px] h-4 w-4 flex items-center justify-center p-0">
                          {conv.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Conversation detail */}
      {selectedConversation ? (
        <div
          className={`${
            selectedId ? "flex" : "hidden md:flex"
          } flex-1 flex-col min-w-0`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:hidden shrink-0"
                onClick={handleBack}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {selectedConversation.player.firstName[0]}
                  {selectedConversation.player.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                  {selectedConversation.player.firstName}{" "}
                  {selectedConversation.player.lastName}
                </p>
                <div className="flex items-center gap-2">
                  {selectedConversation.currentSentiment && (
                    <>
                      <div
                        className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                          sentimentColors[
                            selectedConversation.currentSentiment
                          ] || "bg-gray-400"
                        }`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {sentimentLabels[
                          selectedConversation.currentSentiment
                        ] || ""}
                      </span>
                    </>
                  )}
                  {selectedConversation.isAiBotActive && (
                    <>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        ·
                      </span>
                      <Badge
                        variant="secondary"
                        className="text-[10px] h-4 px-1.5 hidden sm:inline-flex"
                      >
                        <Bot className="h-2.5 w-2.5 mr-0.5" />
                        Bot IA activo
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 relative">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Phone className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setShowActions(!showActions)}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
              {/* Actions dropdown */}
              {showActions && (
                <div className="absolute top-10 right-0 bg-background border rounded-lg shadow-lg py-1 z-50 min-w-[180px]">
                  {selectedConversation.status === "OPEN" && (
                    <button
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                      onClick={() =>
                        handleUpdateConversation("status", "RESOLVED")
                      }
                    >
                      Resolver conversación
                    </button>
                  )}
                  {selectedConversation.status !== "CLOSED" && (
                    <button
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                      onClick={() =>
                        handleUpdateConversation("status", "CLOSED")
                      }
                    >
                      Cerrar conversación
                    </button>
                  )}
                  {selectedConversation.status === "RESOLVED" && (
                    <button
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                      onClick={() =>
                        handleUpdateConversation("status", "OPEN")
                      }
                    >
                      Reabrir conversación
                    </button>
                  )}
                  <button
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                    onClick={() =>
                      handleUpdateConversation(
                        "isAiBotActive",
                        !selectedConversation.isAiBotActive
                      )
                    }
                  >
                    {selectedConversation.isAiBotActive
                      ? "Desactivar bot IA"
                      : "Activar bot IA"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-muted/20">
            {loadingMessages ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">No hay mensajes aún</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.direction === "OUTBOUND"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-lg px-3 py-2 ${
                      msg.direction === "OUTBOUND"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background border"
                    }`}
                  >
                    {msg.templateName && (
                      <span className="text-[10px] opacity-70 block mb-0.5">
                        Template: {msg.templateName}
                      </span>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <div
                      className={`flex items-center gap-1 mt-1 ${
                        msg.direction === "OUTBOUND"
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {msg.isAiGenerated && <Bot className="h-3 w-3" />}
                      <span className="text-[10px]">
                        {formatMessageTime(msg.timestamp)}
                      </span>
                      {msg.direction === "OUTBOUND" && (
                        <StatusIcon status={msg.status} />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 24h window warning */}
          {is24hExpired && messages.length > 0 && (
            <div className="px-3 sm:px-4 py-2 border-t bg-yellow-50 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0" />
              <p className="text-xs text-yellow-700">
                Han pasado más de 24h desde el último mensaje del cliente. Solo
                puedes enviar mensajes de template.
              </p>
            </div>
          )}

          {/* Send error */}
          {sendError && (
            <div className="px-3 sm:px-4 py-2 bg-red-50 text-red-700 text-xs flex items-center gap-2">
              <XCircle className="h-3.5 w-3.5 shrink-0" />
              {sendError}
              <button
                className="ml-auto underline"
                onClick={() => setSendError(null)}
              >
                Cerrar
              </button>
            </div>
          )}

          {/* Message input */}
          <div className="p-3 sm:p-4 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 hidden sm:flex"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                placeholder={
                  is24hExpired && messages.length > 0
                    ? "Solo templates fuera de ventana 24h..."
                    : "Escribe un mensaje..."
                }
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
                disabled={sending}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 hidden sm:flex"
              >
                <Smile className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                className="h-9 w-9 shrink-0"
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || sending}
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Selecciona una conversación</p>
            <p className="text-xs mt-1">
              Los mensajes de WhatsApp aparecerán aquí automáticamente
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
