import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../../services/useWebSocket";
import BarraLateral from "../../components/BarraConfigClient/BarraConfig";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./Chat.css";

export default function Chat() {
  const [chatId, setChatId] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const userId = localStorage.getItem('userId');

  const { enviarViaWebSocket } = useWebSocket(chatId, (novaMensagem) => {
    setMessages(prev => [...prev, {
      userId: novaMensagem.issuer === "USER" ? "me" : "agent",
      content: novaMensagem.content,
    }]);
  });

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!chatId) return;

    fetch(`${API_URL}/api/chats/${chatId}/messages`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao buscar mensagens");
        return res.json();
      })
      .then(data => {
        const historicoFormatado = data.map(msg => ({
          userId: msg.issuer === "USER" ? "me" : "agent",
          content: msg.content,
        }));
        setMessages(historicoFormatado);
      })
      .catch(err => console.error("❌ Erro ao carregar histórico:", err));
  }, [chatId]);


  // Verifica se o chat já existe
  useEffect(() => {
    const storedChatId = localStorage.getItem(`chatId_${userId}`);

    if (storedChatId) {
      fetch(`${API_URL}/api/chats/${storedChatId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      }).then(res => {
        if (res.ok) {
          setChatId(storedChatId);
        } else {
          localStorage.removeItem(`chatId_${userId}`);
          criarNovoChat();
        }
      });
    } else {
      criarNovoChat();
    }
  }, []);

  // Cria um novo chat
  function criarNovoChat() {
    fetch(`${API_URL}/api/users/${userId}/chats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ title: "", summary: "", type: "NORMAL" }),
    })
      .then(res => {
        if (!res.ok) throw new Error("Erro ao criar chat");
        return res.json();
      })
      .then(chat => {
        localStorage.setItem(`chatId_${userId}`, chat.id);
        setChatId(chat.id);
        console.log("✅ Chat criado com ID:", chat.id);
      })
      .catch(err => console.error("❌ Erro ao criar chat:", err));
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !chatId) return;

    const userMessage = { userId: "me", content: input };
    setInput("");

    // Envia via WebSocket — o backend salva e retorna a resposta do agente
    enviarViaWebSocket(chatId, userMessage.content, "USER");
  };

  return (
    <div className="app-layout">
      <BarraLateral />

      <section className="chat-container">
        <section className="chat__messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={msg.userId === "me" ? "message--self" : "message--other"}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.content}
              </ReactMarkdown>
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