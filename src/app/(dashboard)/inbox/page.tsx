"use client";

import { useState } from "react";
import {
  MessageSquare,
  Search,
  Bot,
  User as UserIcon,
  Send,
  Paperclip,
  Smile,
  Sparkles,
  MoreVertical,
  Phone,
  Clock,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// Demo conversations
const demoConversations = [
  {
    id: "1",
    playerName: "Carlos García",
    playerInitials: "CG",
    lastMessage: "Hola, ¿tienen disponibilidad para mañana a las 9?",
    time: "Hace 5 min",
    unread: 2,
    sentiment: "POSITIVE",
    isAiBot: true,
    status: "OPEN",
  },
  {
    id: "2",
    playerName: "James Smith",
    playerInitials: "JS",
    lastMessage: "I would like to book a tee time for Saturday morning",
    time: "Hace 15 min",
    unread: 1,
    sentiment: "NEUTRAL",
    isAiBot: true,
    status: "OPEN",
  },
  {
    id: "3",
    playerName: "Hans Müller",
    playerInitials: "HM",
    lastMessage: "Die Preise sind zu hoch, ich bin enttäuscht",
    time: "Hace 1h",
    unread: 0,
    sentiment: "NEGATIVE",
    isAiBot: false,
    status: "PENDING",
  },
  {
    id: "4",
    playerName: "María López",
    playerInitials: "ML",
    lastMessage: "Muchas gracias por la información! 😊",
    time: "Hace 3h",
    unread: 0,
    sentiment: "POSITIVE",
    isAiBot: false,
    status: "RESOLVED",
  },
];

const demoMessages = [
  {
    id: "m1",
    direction: "INBOUND",
    content: "Hola, buenas tardes!",
    time: "14:30",
    status: "READ",
  },
  {
    id: "m2",
    direction: "INBOUND",
    content: "¿Tienen disponibilidad para mañana a las 9 de la mañana? Seríamos 2 jugadores.",
    time: "14:31",
    status: "READ",
  },
  {
    id: "m3",
    direction: "OUTBOUND",
    content: "¡Hola Carlos! 👋 Sí, tenemos disponibilidad mañana a las 9:00 para 2 jugadores. ¿Quieres que te reserve?",
    time: "14:32",
    status: "READ",
    isAi: true,
  },
  {
    id: "m4",
    direction: "INBOUND",
    content: "Perfecto, sí por favor. ¿Cuál es el precio del green fee?",
    time: "14:35",
    status: "READ",
  },
];

const sentimentColors: Record<string, string> = {
  POSITIVE: "bg-green-500",
  NEUTRAL: "bg-gray-400",
  NEGATIVE: "bg-red-500",
  FRUSTRATED: "bg-red-700",
};

export default function InboxPage() {
  const [selectedId, setSelectedId] = useState("1");
  const [messageInput, setMessageInput] = useState("");

  const selectedConversation = demoConversations.find(
    (c) => c.id === selectedId
  );

  return (
    <div className="flex h-[calc(100vh-7rem)] -m-6">
      {/* Conversation list */}
      <div className="w-80 border-r flex flex-col bg-background">
        <div className="p-4 border-b">
          <h2 className="font-semibold mb-3">Bandeja de Entrada</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar conversaciones..." className="pl-9 h-9" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {demoConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={`w-full text-left p-4 border-b hover:bg-muted/50 transition-colors ${
                selectedId === conv.id ? "bg-muted" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {conv.playerInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${
                      sentimentColors[conv.sentiment]
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">
                      {conv.playerName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {conv.time}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {conv.lastMessage}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    {conv.isAiBot && (
                      <Badge variant="secondary" className="text-[10px] h-4 px-1">
                        <Bot className="h-2.5 w-2.5 mr-0.5" />
                        IA
                      </Badge>
                    )}
                    {conv.unread > 0 && (
                      <Badge className="text-[10px] h-4 w-4 flex items-center justify-center p-0">
                        {conv.unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Conversation detail */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Conversation header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {selectedConversation.playerInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {selectedConversation.playerName}
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-1.5 w-1.5 rounded-full ${
                      sentimentColors[selectedConversation.sentiment]
                    }`}
                  />
                  <span className="text-xs text-muted-foreground">
                    {selectedConversation.sentiment === "POSITIVE"
                      ? "Positivo"
                      : selectedConversation.sentiment === "NEGATIVE"
                      ? "Negativo"
                      : "Neutral"}
                  </span>
                  {selectedConversation.isAiBot && (
                    <>
                      <span className="text-xs text-muted-foreground">·</span>
                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                        <Bot className="h-2.5 w-2.5 mr-0.5" />
                        Bot IA activo
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
            {demoMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.direction === "OUTBOUND" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-3 py-2 ${
                    msg.direction === "OUTBOUND"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <div
                    className={`flex items-center gap-1 mt-1 ${
                      msg.direction === "OUTBOUND"
                        ? "text-primary-foreground/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {(msg as any).isAi && (
                      <Bot className="h-3 w-3" />
                    )}
                    <span className="text-[10px]">{msg.time}</span>
                    {msg.direction === "OUTBOUND" && (
                      <CheckCheck className="h-3 w-3" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI draft suggestion */}
          <div className="px-4 py-2 border-t bg-primary/5">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-primary">Borrador IA</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  &quot;El green fee para mañana es de 65€ por jugador. ¿Confirmo la
                  reserva para 2 a las 9:00? 🏌️&quot;
                </p>
              </div>
              <Button size="sm" variant="outline" className="h-7 text-xs">
                Usar
              </Button>
            </div>
          </div>

          {/* Message input */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Escribe un mensaje..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1"
              />
              <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
                <Smile className="h-4 w-4" />
              </Button>
              <Button size="icon" className="h-9 w-9 shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>Selecciona una conversación</p>
          </div>
        </div>
      )}
    </div>
  );
}
