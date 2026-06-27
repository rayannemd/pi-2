import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export function useWebSocket(chatId, onMensagemRecebida) {
  const clientRef = useRef(null);
  const API_URL = import.meta.env.VITE_WS_URL || "http://localhost:8080";

  useEffect(() => {
    if (!chatId) return;

    const client = new Client({
      // Cria um SockJS novo a cada conexão: reutilizar uma instância pré-criada
      // faz o stompjs perder o onopen e nunca enviar o frame CONNECT.
      webSocketFactory: () => new SockJS(`${API_URL}/ws-chat`),
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
    if (!clientRef.current?.connected) {
      console.warn("WebSocket ainda não conectado; mensagem não enviada.");
      return false;
    }

    clientRef.current.publish({
      destination: `/app/chat/${chatId}/send`,
      body: JSON.stringify({
        chatId,
        content: mensagem,
        issuer: remetente, // "USER" ou "AGENT"
      }),
    });
    return true;
  };

  return { enviarViaWebSocket };
}