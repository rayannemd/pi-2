import { useState } from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput/ChatInput";

export default function Chat() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Oi!", sender: "other" },
    { id: 2, text: "E aí 👋", sender: "me" },
    { id: 3, text: "Teste teste", sender: "other" },
  ]);

  function handleSend(text) {
    if (!text.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text,
        sender: "me",
      },
    ]);
  }

  return (
    <div className="chat-container">
      <ChatMessages messages={messages} />
      <ChatInput onSend={handleSend} />
    </div>
  );
}
