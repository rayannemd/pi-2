import { useEffect, useRef, useState } from "react";
import BarraLateral from "../../components/BarraConfigClient/BarraConfig"
import "./Chat.css"


// LOG DE CARREGAMENTO (Se isso não aparecer no F12, o navegador não leu o arquivo novo)
console.log("🚀 ARQUIVO CHAT.JSX CARREGADO COM SUCESSO!");

const colors = ["cadetblue", "darkgoldenrod", "cornflowerblue", "darkkhaki", "hotpink", "gold"];
const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

export default function Chat() {
  const [logged, setLogged] = useState(false);
  const [chatId, setChatId] = useState(1); // Mudei para 1 pois IDs de banco costumam começar em 1
  const [user, setUser] = useState({ id: "1", name: "Jadiel", color: "blue" });
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = input.trim();
    
    console.log("BUTTON CLICKED - Texto:", text);

    if (!text) {
        console.warn("⚠️ Texto vazio, abortando.");
        return;
    }

    const userMessage = { 
      userId: user.id, 
      userName: user.name, 
      userColor: user.color, 
      content: text 
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8080";
      const url = `${baseUrl}/api/chats/${chatId}/message`; 
      
      console.log("🌐 Preparando requisição para:", url);

      const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/chats/${chatId}/message`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    }
  );  

  const data = await response.json();

  console.log("Resposta do backend:", data);

  const agentAnswer = data?.chatResponse?.answer;

  if (!agentAnswer) {
    console.warn("O agente não respondeu");
    return;
  }

  setMessages((prev) => [
    ...prev,
    {
      userId: "agent",
      content: agentAnswer,
    },
  ]);


    } catch (err) {alert
      console.error("❌ ERRO NA REQUISIÇÃO (fetch):", err);
      alert("ERRO NO ENVIO: " + (err.message || "Erro desconhecido"));
    }
  };


  return (
    <div className="app-layout">
      <BarraLateral />
      <section
        className="chat-container">
        {/* Cabeçalho do chat */}

        {/* Área de mensagens */}
        <section className="chat__messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={msg.userId === user.id ? "message--self" : "message--other"}>
              {msg.userId !== user.id && (
                <div>
                  {msg.userName}
                </div>
              )}
              <div>{msg.content}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </section>
        {/* Input do chat */}
        <form
          className="chat__form"
          onSubmit={handleSendMessage}>
          <input
            type="text"
            className="chat__input"
            placeholder="Digite sua mensagem..."
            required
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="chat__button"
            > Enviar
          </button>
        </form>
      </section>
    </div>
  );
}