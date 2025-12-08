import { Outlet, useNavigate } from "react-router-dom";
import "./Layout.css";

export default function Layout() {
    const navigate = useNavigate();

    return (
        <div className="layout-container">

            {/* Sidebar fixa */}
            <aside className="sidebar">
                <h2 className="sidebar-title">Painel</h2>

                <div className="sidebar-item" onClick={() => navigate("/ConversasInit")}>
                    Conversas
                </div>

                <div className="sidebar-item" onClick={() => navigate("/ChatBot")}>
                    ChatBot
                </div>

                <div className="sidebar-item" onClick={() => navigate("/")}>
                    Voltar ao início
                </div>
            </aside>

            {/* Conteúdo das páginas */}
            <main className="content">
                <Outlet />
            </main>
        </div>
    );
}
