import "./Dashboard.css";
import NavBar from "../../components/Navbar/NavBar.jsx";

import {
  FaRobot,
  FaChartLine,
  FaComments,
  FaUsers,
  FaClock,
} from "react-icons/fa";

export default function Dashboard() {
  const cards = [
    { title: "Atendimento por ChatBot", icon: FaRobot, data: 100 },
    {
      title: "Porcentagem de sucesso com o ChatBot",
      icon: FaRobot,
      data: "99,5%",
    },
    {
      title: "Média de avaliação do usuário",
      icon: FaChartLine,
      data: "4,8/5",
    },
    { title: "Total de atendimentos", icon: FaComments, data: 150 },
    { title: "Fila de espera", icon: FaUsers, data: 0 },
    {
      title: "Tempo médio de atendimento",
      icon: FaClock,
      data: "30 min.",
    },
  ];

  return (
    <div>
      <NavBar />

      <div className="container">
        <div className="cards">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div className="card-container" key={card.title}>
                <div className="card card-header">
                  <Icon size={40} />
                  <span className="card-title">{card.title}</span>
                </div>

                <div className="card card-data">
                  <span className="card-value">{card.data}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
