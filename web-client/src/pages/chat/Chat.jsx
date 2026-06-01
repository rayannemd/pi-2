import { useEffect, useRef, useState } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { QRCodeCanvas } from "qrcode.react";
import BarraLateral from "../../components/BarraConfigClient/BarraConfig";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./Chat.css";

export default function Chat() {
  const [chatId, setChatId] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const stompRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const userId = localStorage.getItem('userId');

  //Faz o scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  // Carrega mensagens anteriores quando o chatId estiver pronto
  useEffect(() => {
    if (!chatId) return;

    fetch(`${API_URL}/api/chats/${chatId}/messages`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
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

  //Cria ou retorna um chat existente quando o usuário abre a tela
  useEffect(() => {
    const storedChatId = localStorage.getItem("chatId");

    if(storedChatId){
      //Verifica se o chat existe no banco de dados
      fetch(`${API_URL}/api/chats/${storedChatId}`, {
        headers: {authorization: `Bearer ${localStorage.getItem("token")}`}
      }).then(res => {
        if (res.ok) { //Se o chat existir no banco retorna ele
          setChatId(storedChatId);
        }else{ //Se o chat com esse ID não existir mais, limpa o localStorage e cria outro
          localStorage.removeItem("chatId");
          criarNovoChat();
        }
      });
    }else{
      criarNovoChat();
    }
  }, []);

  // Função para criar um novo chat
  function criarNovoChat(){
    console.log("Criando novo chat...");
    console.log(userId);

    fetch(`${API_URL}/api/users/${userId}/chats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ title: "", summary: "", type: "NORMAL" }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao criar chat");
        return res.json();
      })
      .then((chat) => {''
        localStorage.setItem("chatId", chat.id)
        setChatId(chat.id);
        console.log("✅ Chat criado com sucesso. Id do chat: ", chat.id);
      })
      .catch((err) => {
        console.error("❌ Erro ao criar chat:", err);
      });
  }

  //Envio de mensagens
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !chatId) return;

    const userMessage = { userId: "me", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      //Envia a mensagem do cliente pro backend e espera a resposta do chat
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

      //Recebe a mensagem do agente e adiciona no chat
      setMessages((prev) => [
        ...prev,
        {
          userId: "agent",
          content: agentAnswer,
        },
      ]);
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
