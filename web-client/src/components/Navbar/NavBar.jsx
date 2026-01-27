import "./NavBar.css";
import { Link } from "react-router-dom";
import { FaHome, FaBars } from "react-icons/fa";
import { useState } from "react";

const pages = [
  { label: "ChatBot", path: "/chatbot" },
  { label: "Conversas", path: "/conversas" },
];

export default function NavBar() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* HOME */}
        <Link to="/home" className="home-btn">
          <FaHome size={20} />
        </Link>

        <div className="divider" />

        {/* DESKTOP MENU */}
        <nav className="nav-links desktop">
          {pages.map((page) => (
            <Link key={page.path} to={page.path}>
              {page.label}
            </Link>
          ))}
        </nav>

        {/* MOBILE MENU */}
        <button
          className="menu-toggle mobile"
          onClick={() => setMenuAberto(!menuAberto)}
        >
          <FaBars />
        </button>
      </div>

      {/* MOBILE DROPDOWN */}
      {menuAberto && (
        <div className="mobile-menu">
          {pages.map((page) => (
            <Link
              key={page.path}
              to={page.path}
              onClick={() => setMenuAberto(false)}
            >
              {page.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
