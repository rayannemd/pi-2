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
     CRIA O CHAT AO ABRIR A TELA
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
        // 🔴 Backend ainda não retorna o chat,
        // mas estamos prontos para quando retornar
        return res.headers.get("location") || null;
      })
      .then((location) => { 
        /**
         * 🔮 FUTURO:
         * Quando o backend retornar o chat ou o id,
         * esse código já funciona sem mudar nada
         */
        const fakeId = 1; // enquanto o backend não retorna
        localStorage.setItem("chatId", fakeId);
        setChatId(fakeId);
        console.log("✅ Chat pronto (aguardando backend retornar id real)");
      })
      .catch((err) => {
        console.error("❌ Erro ao criar chat:", err);
      });
  }, []);

  /* ===============================
     ENVIO DE MENSAGEM
  =============================== */
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !chatId) return;

    const userMessage = {
      userId: "me",
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
          userId: "agent",
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
                msg.userId === "me"
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
