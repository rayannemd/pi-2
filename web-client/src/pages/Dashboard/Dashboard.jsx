import "./Dashboard.css";

import NavBar from "../../components/Navbar/NavBar.jsx";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

import SmartToyIcon from "@mui/icons-material/SmartToy";
import MovingIcon from "@mui/icons-material/Moving";
import ChatBubbleIcon from "@mui/icons-material/ChatBubble";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export default function Dashboard() {
  const cards = [
    { title: "Atendimento por ChatBot", icon: SmartToyIcon, data: 100 },
    {
      title: "Porcentagem de sucesso com o ChatBot",
      icon: SmartToyIcon,
      data: "99,5%",
    },
    { title: "Média de avaliação do usuário", icon: MovingIcon, data: "4,8/5" },
    { title: "Total de atendimentos", icon: ChatBubbleIcon, data: 150 },
    { title: "Fila de espera", icon: PeopleAltIcon, data: 0 },
    {
      title: "Tempo médio de atendimento",
      icon: AccessTimeIcon,
      data: "30 min.",
    },
  ];

  return (
    <div>
      <NavBar />
      <div className="container flex">
        <div className="cards flex">
          {cards.map((card) => (
            <div className="card-container">
              <Card key={card.title}>
                <CardContent className="card-content flex">
                  <card.icon sx={{ fontSize: 40 }} />
                  <Typography variant="h7">{card.title}</Typography>
                </CardContent>
              </Card>
              <Card key={card.title}>
                <CardContent className="card-data flex">
                  <Typography>{card.data}</Typography>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      <div></div>
      </div>
    </div>
  );
}
