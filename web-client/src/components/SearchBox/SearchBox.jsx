import { useState } from "react";
import "./SearchBox.css";

export default function SearchBox({
  placeholder = "Pergunte alguma coisa.",
  onSend,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    if (onSend) onSend(searchTerm.trim());
    setSearchTerm("");
  }

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearch = () => {
    console.log(searchTerm);
  };

  return (
    <form
      className="search-box"
      onSubmit={handleSubmit}
      aria-label="Caixa de pesquisa"
    >
      <input
        className="search-input"
        value={searchTerm}
        onChange={handleInputChange}
        placeholder={placeholder}
        aria-label="Pergunte alguma coisa"
        onKeyDown={(event) => (event.key === "Enter" ? handleSearch() : null)}
      />
      <button className="send-button" type="submit" aria-label="Enviar">
        {/* Ícone simples em SVG inline */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M22 2L11 13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22 2L15 22L11 13L2 9L22 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </form>
  );
}
