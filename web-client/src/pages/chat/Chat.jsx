import { useEffect, useRef, useState } from "react";
import BarraLateral from "../../components/BarraConfigClient/BarraConfig";
import "./Chat.css";

export default function Chat() {
  const [chatId, setChatId] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  /* ===============================
     SCROLL AUTOMÁTICO
  =============================== */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ===============================
     CRIA OU REUTILIZA CHAT
  =============================== */
  useEffect(() => {
    const storedChatId = localStorage.getItem("chatId");

    if (storedChatId) {
      console.log("💾 Chat já existente:", storedChatId);
      setChatId(storedChatId);
      return;
    }

    console.log("🆕 Criando novo chat...");

    fetch(`${API_URL}/api/chats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        title: "",
        summary: "",
        type: "NORMAL",
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao criar chat");
        return res.headers.get("location") || null;
      })
      .then(() => {
        // ⚠️ enquanto o backend não retorna o id real
        const fakeId = 1;
        localStorage.setItem("chatId", fakeId);
        setChatId(fakeId);
        console.log("✅ Chat criado (aguardando backend retornar id)");
      })
      .catch((err) => {
        console.error("❌ Erro ao criar chat:", err);
      });
  }, []);

  /* ===============================
     CARREGA MENSAGENS SALVAS
  =============================== */
  useEffect(() => {
    if (!chatId) return;

    fetch(`${API_URL}/api/chats/${chatId}/messages`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const formattedMessages = data.map((msg) => ({
          issuer: msg.issuer, // USER | AGENT
          content: msg.content,
        }));
        setMessages(formattedMessages);
      })
      .catch((err) => {
        console.error("❌ Erro ao carregar mensagens:", err);
      });
  }, [chatId]);

  /* ===============================
     ENVIO DE MENSAGEM
  =============================== */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !chatId) return;

    const userMessage = {
      issuer: "USER",
      content: input,
    };

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
      const agentAnswer = data?.chatResponse?.answer;

      if (!agentAnswer) return;

      setMessages((prev) => [
        ...prev,
        {
          issuer: "AGENT",
          content: agentAnswer,
        },
      ]);
    } catch (err) {
      console.error("❌ Erro no envio:", err);
    }
  };

  return (
    <div className="app-layout">
      <BarraLateral />

      <section className="chat-container">
        <section className="chat__messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={
                msg.issuer === "USER"
                  ? "message--self"
                  : "message--other"
              }
            >
              {msg.content}
            </div>
          ))}
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
