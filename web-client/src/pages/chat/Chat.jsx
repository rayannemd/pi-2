import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { useWebSocket } from "../../services/useWebSocket";
import ModalAvaliacao from '../../components/ModalAvaliacao/ModalAvaliacao.jsx';
import authedFetch from "../../services/authFetch";
import SearchBox from "../../components/SearchBox/SearchBox.jsx";
import Logo from "../../components/Logo/Logo.jsx";
import BarraLateral from "../../components/BarraConfigClient/BarraConfig";
import userIcon from "../../assets/icons/User.svg";
import configIcon from "../../assets/icons/Config.svg";
import { Box, Typography, Avatar, TextField, IconButton, Menu, MenuItem } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../../styles/StandardScreen.css"
import "./Chat.css";




function formatBRL(value) {
  return Number(value ?? 0).toFixed(2);
}



export default function Chat() {

//  const [conversaSelecionada, setConversaSelecionada] = useState(null);
//   const [conversas, setConversas] = useState([]);

  const [chatId, setChatId] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const [layoutInicial, setLayoutInicial] = useState(true);
  const [loadingChat, setLoadingChat] = useState(true);

  const [modalAberto, setModalAberto] = useState(false);
  const [chatConcluido, setChatConcluido] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const userId = localStorage.getItem("userId");

  const pushMessages = (...msgs) => setMessages((prev) => [...prev, ...msgs]);
  const pushAgentText = (content) =>
    pushMessages({
      userId: "agent",
      content,
      hora: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    });

    async function resolverConversa(id = chatId) {
          try {
            const res = await authedFetch(
              `${API_URL}/api/chats/${id}/concluir`,
              {
                method: "PUT",
              }
            );

            if (!res.ok) {
              throw new Error("Erro ao concluir conversa");
            }

            setModalAberto(true);

            setChatConcluido(true);

          } catch (err) {
            console.error(err);
          }
  }


  useWebSocket(chatId, (novaMensagem) => {
    // Ignora mensagens do próprio usuário — já foram adicionadas no render otimista
    // Ignora as mensagens do agente - Já foram adicionadas via handleSendMessage
    if (novaMensagem.issuer === "USER" || novaMensagem.issuer === "AGENT")
      return;

    // Renderiza as mensagens do admin
    setMessages((prev) => [
      ...prev,
      {
        userId: "admin",
        content: novaMensagem.content,
        hora: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  },
  () => {
    setModalAberto(true);
  }
);

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  // useEffect para carregar as mensagens antigas do chat
  useEffect(() => {
    if (!chatId) return;
    if (layoutInicial) return;

    authedFetch(`${API_URL}/api/chats/${chatId}/messages`)
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar mensagens");
        return res.json();
      })
      .then((data) => {
        const historicoFormatado = data.map((msg) => ({
          userId: msg.issuer === "USER" ? "me" : "agent",
          content: msg.content,
          hora: new Date(msg.createDate).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));
        setMessages(historicoFormatado);
      })
      .catch((err) => console.error("❌ Erro ao carregar histórico:", err));
  }, [chatId]);

  // useEffect para buscar o chat mais recente do cliente
  useEffect(() => {
    if (!userId) return;

    authedFetch(`${API_URL}/api/users/${userId}/chats`)
      .then((res) => (res.ok ? res.json() : []))
      .then((chats) => {
        if (Array.isArray(chats) && chats.length > 0) {
          // Retoma o chat mais recente do usuário
          const maisRecente = chats.reduce((a, b) => (b.id > a.id ? b : a));
          localStorage.setItem(`chatId_${userId}`, maisRecente.id);
          setChatId(maisRecente.id);
          setLayoutInicial(false);
        }
      })
      .catch(() => console.error("Erro ao buscar chat"))
      .finally(() => setLoadingChat(false));
  }, []);

  // Função para criar um novo chat
  async function criarNovoChat(firstMessage) {
    const res = await authedFetch(`${API_URL}/api/users/${userId}/chats`, {
      method: "POST",
      body: JSON.stringify({ title: "", summary: "", type: "NORMAL" }),
    });
    if (!res.ok) throw new Error("Erro ao criar chat");

    const chat = await res.json();
    localStorage.setItem(`chatId_${userId}`, chat.id);
    setChatId(chat.id);
    console.log("✅ Chat criado com ID:", chat.id);
    await sendMessage(firstMessage, chat.id);
  }

  async function handleSendFirstMessage(firstMessage) {
    try{
      await criarNovoChat(firstMessage);
      setLayoutInicial(false);
    } catch(err){
      console.error("Erro ao iniciar chat:", err);
      alert("Erro ao iniciar conversa. Tente novamente.");
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !chatId) return;
    const msg = input;
    setInput("");
    await sendMessage(msg);
  };

  const sendMessage = async (msg, id = chatId) => {
    if (!msg.trim() || !id) return;

    const userMessage = {
      id: Math.random(),
      userId: "me",
      content: msg,
      hora: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // O cliente envia somente via REST (que aciona o agente e trata a resposta).
    // O WebSocket é usado apenas para RECEBER as mensagens do admin em tempo real;
    // enviar também por WS causaria chamada dupla ao agente e mensagens duplicadas.
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await authedFetch(
        `${API_URL}/api/chats/${id}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ message: userMessage.content }),
        },
      );

      if (!response.ok) throw new Error("Erro ao enviar mensagem");

      // Verifica se a resposta tem conteúdo antes de parsear
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) return;

      const data = await response.json();

      handleAgentResponse(data);
      
    } catch (err) {
      const idToRemove = userMessage.id;
      setMessages((prev) => prev.filter((msg) => msg.id !== idToRemove));
      console.error("Erro no envio:", err);
      alert("Erro ao enviar mensagem! Tente novamente.");
    }
  };

  const handleAgentResponse = (data) => {
    if (!data) return;

    switch (data.type) {
      case "chat": {
        const answer = data?.chatResponse?.answer;
        if (answer) pushAgentText(answer);
        return;
      }
      case "pagamento_plano": {
        const installments = Array.isArray(data?.payload) ? data.payload : [];
        if (installments.length === 0) {
          pushAgentText("Você não possui mensalidades em aberto no momento.");
          return;
        }
        pushMessages(
          {
            userId: "agent",
            content:
              "Estas são suas mensalidades em aberto. Selecione quais deseja pagar.",
            hora: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
          { userId: "agent", kind: "installments", installments },
        );
        return;
      }
      case "status_pagamento": {
        const charge = data?.payload;
        if (!charge) {
          pushAgentText("Você ainda não possui cobranças geradas neste chat.");
          return;
        }
        const statusText =
          {
            PAID: "já foi paga. Obrigado!",
            EXPIRED: "expirou. Gere uma nova para pagar.",
            FAILED: "falhou. Tente gerar novamente.",
          }[charge.status] || "ainda está pendente de pagamento.";
        pushAgentText(
          `Sua cobrança de R$ ${formatBRL(charge.amount)} ${statusText}`,
        );
        return;
      }
      case "consulta_plano": {
        pushAgentText("Aqui estão os seus planos contratados.");
        return;
      }
      default:
        return;
    }
  };

  const handlePayInstallments = async (installmentIds) => {
    if (!chatId || !installmentIds?.length) return;

    try {
      const response = await authedFetch(
        `${API_URL}/api/chats/${chatId}/charges`,
        {
          method: "POST",
          body: JSON.stringify({ installmentIds }),
        },
      );

      if (!response.ok) throw new Error("Erro ao gerar cobrança");

      const charge = await response.json();
      pushMessages({ userId: "agent", kind: "charge", charge });
      return charge;
    } catch (err) {
      pushAgentText(
        "Não consegui gerar a cobrança agora. Tente novamente em instantes.",
      );
      throw err;
    }
  };

  /* ===============================
      RENDER
  =============================== */
  if(loadingChat) return null;
  if(layoutInicial){
    return (
      <div className="tela-root">
        <div className="tela-inner">
          <div className="flex">
            <Logo />
            <h1 className="brand">
              PLANETA NET <span className="dot-telecom">.TELECOM</span>
            </h1>
          </div>
          <p className="help-text">Como posso te ajudar?</p>

          <SearchBox placeholder="Pergunte alguma coisa." onSend={handleSendFirstMessage} />
        </div>

        <div className="tela-options">
          <div className="user-icon">
            <Link to={"/login"}>
              <i>
                <img src={userIcon} alt="Usuário" className="icon-img" />
              </i>
            </Link>
          </div>

          <div className="config-icon">
            <i>
              <img src={configIcon} alt="Configurações" className="icon-img" />
            </i>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <BarraLateral />

      <section className="chat-container">

    <Box sx={{ p: 2, bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between',    boxShadow: '0px 2px 5px rgba(0,0,0,0.1)', zIndex: 1 }}>

       <Box
            onClick={() => resolverConversa(chatId)}
            sx={{
              color: "green",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Marcar como Resolvida
      </Box>

      </Box>

        <section className="chat__messages">
          {messages.map((msg, index) => {
            if (msg.kind === "installments") {
              return (
                <InstallmentSelection
                  key={index}
                  installments={msg.installments}
                  onPay={handlePayInstallments}
                />
              );
            }
            if (msg.kind === "charge") {
              return <ChargeBubble key={index} charge={msg.charge} />;
            }
            return (
              <Box
                key={index}
                sx={{
                  alignSelf: msg.userId === "me" ? "flex-end" : "flex-start",
                  maxWidth: "50%",
                  bgcolor: msg.userId === "me" ? "#dcf8c6" : "white",
                  p: 1.5,
                  borderRadius:
                    msg.userId === "me"
                      ? "15px 15px 0px 15px"
                      : "0px 15px 15px 15px",
                  boxShadow: "0px 1px 3px rgba(0,0,0,0.2)",
                  wordBreak: "break-word",
                }}
              >
                {msg.userId === "me" ? (
                  <Typography variant="body2">{msg.content}</Typography>
                ) : (
                  <Typography variant="body2" component="div">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  </Typography>
                )}
                {msg.hora && (
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      textAlign: "right",
                      mt: 0.5,
                      color: "gray",
                    }}
                  >
                    {msg.hora}
                  </Typography>
                )}
              </Box>
            );
          })}

          {modalAberto && (
  <Box
    sx={{
      alignSelf: "flex-start",
      maxWidth: "50%",
      bgcolor: "white",
      p: 1.5,
      borderRadius: "0px 15px 15px 15px",
      boxShadow: "0px 1px 3px rgba(0,0,0,0.2)",
    }}
  >
    <ModalAvaliacao
      chatId={chatId}
      API_URL={API_URL}
      
    />
  </Box>
)}

          <div ref={messagesEndRef} />
        </section>

        <form className="chat__form" onSubmit={handleSendMessage}>
          <input
            type="text"
            className="chat__input"
            placeholder={chatConcluido ?"Essa conversa foi finalizada. Não é possível enviar mais mensagens." : "Digite sua mensagem..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={chatConcluido}
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

function InstallmentSelection({ installments, onPay }) {
  const [selected, setSelected] = useState(() => new Set());
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const total = installments
    .filter((i) => selected.has(i.id))
    .reduce((sum, i) => sum + Number(i.amount), 0);

  const pay = async () => {
    if (selected.size === 0 || loading || done) return;
    setLoading(true);
    try {
      await onPay(Array.from(selected));
      setDone(true);
    } catch (err) {
      console.error("Falha ao gerar cobrança:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="message--other installments">
      <div className="installments__title">Mensalidades em aberto</div>

      <ul className="installments__list">
        {installments.map((i) => (
          <li key={i.id} className="installments__item">
            <label>
              <input
                type="checkbox"
                checked={selected.has(i.id)}
                onChange={() => toggle(i.id)}
                disabled={done}
              />
              <span className="installments__plan">{i.planName}</span>
              <span className="installments__month">{i.referenceMonth}</span>
              <span className="installments__amount">
                R$ {formatBRL(i.amount)}
              </span>
            </label>
          </li>
        ))}
      </ul>

      <div className="installments__total">Total: R$ {formatBRL(total)}</div>

      <button
        type="button"
        className="installments__pay"
        onClick={pay}
        disabled={selected.size === 0 || loading || done}
      >
        {done
          ? "Cobrança gerada"
          : loading
            ? "Gerando..."
            : "Pagar selecionadas"}
      </button>
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

  return (
    <div className="message--other charge-bubble">
      <div className="charge-bubble__title">Cobrança Pix gerada</div>
      <div className="charge-bubble__amount">R$ {formatBRL(charge.amount)}</div>

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
