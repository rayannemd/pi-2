import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export function useWebSocket(chatId, onMensagemRecebida) {
  const clientRef = useRef(null);
  const API_URL = import.meta.env.VITE_WS_URL || "http://localhost:8080";

  useEffect(() => {
    if (!chatId) return;

    const socket = new SockJS(`${API_URL}/ws-chat`);
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log("✅ WebSocket conectado, chat:", chatId);

        // Escuta mensagens de um chat específico
        client.subscribe(`/topic/chat/${chatId}`, (message) => {
          const novaMensagem = JSON.parse(message.body);
          onMensagemRecebida(novaMensagem);
        });
      },
      onDisconnect: () => console.log("❌ WebSocket desconectado"),
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
  }, [chatId]);

  const enviarViaWebSocket = (chatId, mensagem, remetente) => {
    if (!clientRef.current?.connected) return;

    clientRef.current.publish({
      destination: `/app/chat/${chatId}/send`,
      body: JSON.stringify({
        chatId,
        content: mensagem,
        issuer: remetente, // "USER" ou "AGENT"
      }),
    });
  };

  return { enviarViaWebSocket };
}