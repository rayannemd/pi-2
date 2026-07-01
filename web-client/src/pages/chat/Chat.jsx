import { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../../services/useWebSocket";
import { QRCodeCanvas } from "qrcode.react";
import BarraLateral from "../../components/BarraConfigClient/BarraConfig";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./Chat.css";

function authedFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      ...(options.headers || {}),
    },
  });
}

function formatBRL(value) {
  return Number(value ?? 0).toFixed(2);
}

export default function Chat() {
  const [chatId, setChatId] = useState(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const userId = localStorage.getItem("userId");

  const pushMessages = (...msgs) => setMessages((prev) => [...prev, ...msgs]);
  const pushAgentText = (content) => pushMessages({ userId: "agent", content });

  const { enviarViaWebSocket } = useWebSocket(chatId, (novaMensagem) => {
    setMessages(prev => [...prev, {
      userId: novaMensagem.issuer === "USER" ? "me" : "agent",
      content: novaMensagem.content,
    }]);
  });

  // Scroll automático
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    if (!chatId) return;

    authedFetch(`${API_URL}/api/chats/${chatId}/messages`)
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


  // Retoma o chat do próprio usuário a partir do banco (endpoint já existente
  // GET /api/users/{id}/chats). Isso garante que, ao atualizar a página ou voltar
  // com o mesmo usuário, o chat e suas mensagens são recarregados — sem depender
  // do localStorage (que não sobrevive a outro navegador/aba anônima/cache limpo).
  useEffect(() => {
    if (!userId) return;

    authedFetch(`${API_URL}/api/users/${userId}/chats`)
      .then(res => (res.ok ? res.json() : []))
      .then(chats => {
        if (Array.isArray(chats) && chats.length > 0) {
          // Retoma o chat mais recente do usuário
          const maisRecente = chats.reduce((a, b) => (b.id > a.id ? b : a));
          localStorage.setItem(`chatId_${userId}`, maisRecente.id);
          setChatId(maisRecente.id);
        } else {
          criarNovoChat();
        }
      })
      .catch(() => criarNovoChat());
  }, []);

  // Função para criar um novo chat
  function criarNovoChat(){
    authedFetch(`${API_URL}/api/users/${userId}/chats`, {
      method: "POST",
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

    // O cliente envia somente via REST (que aciona o agente e trata a resposta).
    // O WebSocket é usado apenas para RECEBER as mensagens do admin em tempo real;
    // enviar também por WS causaria chamada dupla ao agente e mensagens duplicadas.
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await authedFetch(
        `${API_URL}/api/chats/${chatId}/messages`,
        {
          method: "POST",
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
          { userId: "agent", content: "Estas são suas mensalidades em aberto. Selecione quais deseja pagar." },
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
        const statusText = {
          PAID: "já foi paga. Obrigado!",
          EXPIRED: "expirou. Gere uma nova para pagar.",
          FAILED: "falhou. Tente gerar novamente.",
        }[charge.status] || "ainda está pendente de pagamento.";
        pushAgentText(`Sua cobrança de R$ ${formatBRL(charge.amount)} ${statusText}`);
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
      const response = await authedFetch(`${API_URL}/api/chats/${chatId}/charges`, {
        method: "POST",
        body: JSON.stringify({ installmentIds }),
      });

      if (!response.ok) throw new Error("Erro ao gerar cobrança");

      const charge = await response.json();
      pushMessages({ userId: "agent", kind: "charge", charge });
      return charge;
    } catch (err) {
      pushAgentText("Não consegui gerar a cobrança agora. Tente novamente em instantes.");
      throw err;
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
                {msg.userId === "me" ? (
                  msg.content
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                )}
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
        {done ? "Cobrança gerada" : loading ? "Gerando..." : "Pagar selecionadas"}
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
