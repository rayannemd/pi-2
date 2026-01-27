import "./MessageBubble.css";

export default function MessageBubble({ message }) {
  const isMe = message.sender === "me";

  return (
    <div className={`message-row ${isMe ? "me" : "other"}`}>
      <div className="message-bubble">{message.text}</div>
    </div>
  );
}
