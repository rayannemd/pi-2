import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Rating, Typography } from "@mui/material";
import authedFetch from "../../services/authFetch";

export default function ModalAvaliacao({ openModal, chatId, API_URL, closeModal }) {
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
    <Dialog open={openModal}>
      <DialogTitle>Como você avalia o atendimento?</DialogTitle>
      <DialogContent>
        <Typography>Selecione uma nota de 1 a 5:</Typography>
        <Rating
          value={nota}
          onChange={(e, novoValor) => {
            setNota(novoValor);
            enviarAvaliacao(novoValor); 
          }}
        />
      </DialogContent>
    </Dialog>
  );
}