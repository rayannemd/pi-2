import MessageBubble from "./MessageBubble/MessageBubble";

export default function ChatMessages({ messages }) {
  return (
    <div className="chat-messages">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
    </div>
  );
}
