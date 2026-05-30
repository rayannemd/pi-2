import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { QRCodeCanvas } from "qrcode.react";
import BarraLateral from "../../components/BarraConfigClient/BarraConfig";
import "./Chat.css";

export default function Chat() {
  const [chatId, setChatId] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const stompRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const WS_URL = import.meta.env.VITE_WS_URL || `${API_URL}/ws-chat`;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    const storedChatId = localStorage.getItem("chatId");

    if (storedChatId) {
      setChatId(storedChatId);
      return;
    }

    fetch(`${API_URL}/api/chats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ title: "", summary: "", type: "NORMAL" }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Erro ao criar chat: HTTP ${res.status}`);
        return res.json();
      })
      .then((chat) => {
        if (!chat?.id) throw new Error("Backend nao retornou id do chat");
        localStorage.setItem("chatId", chat.id);
        setChatId(chat.id);
      })
      .catch((err) => console.error("Erro ao criar chat:", err));
  }, []);

  /* ===============================
     WEBSOCKET — notificação de pagamento
  =============================== */
  useEffect(() => {
    if (!chatId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/chats/${chatId}`, (frame) => {
          try {
            const payload = JSON.parse(frame.body);
            const content = payload?.content;
            if (!content) return;

            setMessages((prev) => [
              ...prev,
              { userId: "agent", content },
            ]);
          } catch (err) {
            console.error("Erro ao processar mensagem do socket:", err);
          }
        });
      },
    });

    client.activate();
    stompRef.current = client;

    return () => {
      client.deactivate();
      stompRef.current = null;
    };
  }, [chatId, WS_URL]);

  /* ===============================
     ENVIO DE MENSAGEM
  =============================== */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !chatId) return;

    const userMessage = { userId: "me", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch(
        `${API_URL}/api/chats/${chatId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ message: userMessage.content }),
        }
      );

      if (!response.ok) throw new Error("Erro ao enviar mensagem");

      const data = await response.json();
      handleAgentResponse(data);
    } catch (err) {
      console.error("Erro no envio:", err);
    }
  };

  const handleAgentResponse = (data) => {
    if (!data) return;

    switch (data.type) {
      case "chat": {
        const answer = data?.chatResponse?.answer;
        if (answer) {
          setMessages((prev) => [
            ...prev,
            { userId: "agent", content: answer },
          ]);
        }
        return;
      }
      case "payment_request": {
        const charge = data?.payload;
        if (!charge) return;
        setMessages((prev) => [
          ...prev,
          {
            userId: "agent",
            kind: "charge",
            charge,
          },
        ]);
        return;
      }
      case "consulta_plano": {
        // exibir lista de planos
        setMessages((prev) => [
          ...prev,
          {
            userId: "agent",
            content: "Aqui estão os seus planos contratados.",
          },
        ]);
        return;
      }
      default:
        return;
    }
  };

  /* ===============================
     RENDER
  =============================== */
  return (
    <div className="app-layout">
      <BarraLateral />

      <section className="chat-container">
        <section className="chat__messages">
          {messages.map((msg, index) => {
            if (msg.kind === "charge") {
              return (
                <ChargeBubble key={index} charge={msg.charge} />
              );
            }
            return (
              <div
                key={index}
                className={
                  msg.userId === "me" ? "message--self" : "message--other"
                }
              >
                {msg.content}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </section>

        <form className="chat__form" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="chat__input"
            placeholder="Digite sua mensagem..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            required
          />
          <button type="submit" className="chat__button">
            Enviar
          </button>
        </form>
      </section>
    </div>
  );
}

function ChargeBubble({ charge }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(charge.copyPaste || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Falha ao copiar:", err);
    }
  };

  const amount = typeof charge.amount === "number"
    ? charge.amount.toFixed(2)
    : charge.amount;

  return (
    <div className="message--other charge-bubble">
      <div className="charge-bubble__title">Cobrança Pix gerada</div>
      <div className="charge-bubble__amount">R$ {amount}</div>

      {charge.copyPaste && (
        <div className="charge-bubble__qr">
          <QRCodeCanvas value={charge.copyPaste} size={160} />
        </div>
      )}

      <button
        type="button"
        className="charge-bubble__copy"
        onClick={copy}
        disabled={!charge.copyPaste}
      >
        {copied ? "Copiado!" : "Copiar código Pix"}
      </button>

      <div className="charge-bubble__status">
        Status: {charge.status || "PENDING"}
      </div>
    </div>
  );
}
