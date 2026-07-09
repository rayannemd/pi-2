import { useState } from "react";
import { Rating, Typography, Paper } from "@mui/material";
import authedFetch from "../../services/authFetch";

export default function ModalAvaliacao({
  chatId,
  API_URL,
  closeModal,
}) {
  const [nota, setNota] = useState(0);

  const enviarAvaliacao = async (notaSelecionada) => {
    if (!notaSelecionada) return;

    await authedFetch(`${API_URL}/api/chats/${chatId}/rating`, {
      method: "PUT",
      body: JSON.stringify({ chatRating: notaSelecionada }),
    });

    closeModal();
  };

  return (
  <>
    <Typography fontWeight="bold">
      Como você avalia o atendimento?
    </Typography>

    <Typography variant="body2">
      Selecione uma nota de 1 a 5:
    </Typography>

    <Rating
      value={nota}
      onChange={(e, novoValor) => {
        setNota(novoValor);
        enviarAvaliacao(novoValor);
      }}
    />
  </>
);
}