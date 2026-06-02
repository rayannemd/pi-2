import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, TextField, IconButton, Menu, MenuItem } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { mensagensMock } from '../../Mock/mensagensMock';


export default function LayoutChat({ conversaAtual, resolverConversa, setExibirMensagem }) {

  // console.log("Conversa selecionada:", conversaAtual); teste para ver conversa selec.

  const [ancora, setAncora] = useState(null);
  const open = Boolean(ancora);

  const handleClick = (event) => setAncora(event.currentTarget);
  const handleClose = () => setAncora(null);

  const [mensagem, setMensagem] = useState('');
  const [mensagensDoBackEnd, setMensagensDoBackEnd] = useState([]);
  




  // Carregar mensagens do mock da conversa selecionada
  // pega o id das conversas e exibe apenas o necessário na conversa, sem vazar de outros id (outra conversa)
  useEffect(() => {
    if (!conversaAtual) return;

    const msgsDaConversa = mensagensMock.filter(
      msg => msg.conversaId === conversaAtual.id
    );

    setMensagensDoBackEnd(msgsDaConversa);
  }, [conversaAtual]);


{/*esse bloco de codigo abaixo, refere básicamente para montagem do código no qual 
  enviamos uma mensagem, é os dados da mensagem inseridos aqui. NN pode enviar vazio, por causa do .trim  */}
  const enviarMensagem = () => {
    if (mensagem.trim() === "") return;
    const novaMsg = {
      id: Math.random(),
      texto: mensagem,
      remetente: 'adm',
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMensagensDoBackEnd([...mensagensDoBackEnd, novaMsg]);
    setMensagem('');
  };

  // Mensagem de "nenhuma conversa selecionada"
  if (!conversaAtual) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', bgcolor: '#f0f2f5' }}> {/*Cor de fundo chat vazio */}
        <Typography variant="h6" sx={{ color: '#667781' }}> {/* cor referente ao texto quando nn há conversas selecionada.*/}
          Selecione uma conversa para começar.
        </Typography>
      </Box>
    );
  }



  return (
    // box
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: '#f0f2f5', flex: 1 }}> 
      
      {/* CABEÇALHO */}
      <Box sx={{ p: 2, bgcolor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0px 2px 5px rgba(0,0,0,0.1)', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ mr: 2, bgcolor: '#9d1a1a' }}>
            {conversaAtual.nome ? conversaAtual.nome[0] : "?"} {/*Aqui basicamente pega a 1º letra do nome e coloca no avatar. */}
          </Avatar>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{conversaAtual.nome} </Typography> {/*pega o  nome e coloca na barra superior da conversa. */}
            {/* <Typography variant="caption" color="success.main">Online</Typography> */}  {/* aqui é o online que estava estático, posteriormente, podemos adicionar*/}
          </Box>
        </Box>

{/* O trecho abaixo é sobre o MARCAR COMO RESOLVIDA que existe em todas as conversas - na teoria.
Não funciona ainda, devemos implementar para resolver a conversa e impossibilitar de enviar msg nesse chat (inclusive o bot) */}
{/* Incio do bloco de marcar como resolvida */}
        <Box>
          <IconButton onClick={handleClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu anchorEl={ancora} open={open} onClose={handleClose}>
            <MenuItem onClick={() => {resolverConversa(conversaAtual.id); setExibirMensagem(true)}} sx={{ color: 'green', fontWeight: 'bold' }}>
              Marcar como Resolvida
            </MenuItem>
          </Menu>
        </Box>
      </Box>
{/* fim do bloco de marcar como resolvida */}


      {/* MENSAGENS (bloco que fica as mensagens lá) */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 , 
        overflowY: 'auto', scrollbarWidth: 'none',}}>
        {/* PAra cada mensagem do back, ele retorna esse box, que é a caixa de dialogo  */}
        {/* Sendo o remetendo esverdeada, e o cliente branca */}
        {mensagensDoBackEnd.map(msg => (
          <Box 
            key={msg.id}
            sx={{ 
              alignSelf: msg.remetente === 'cliente' ? 'flex-start' : 'flex-end', 
              maxWidth: '50%', 
              bgcolor: msg.remetente === 'cliente' ? 'white' : '#dcf8c6', 
              p: 1.5, 
              borderRadius: msg.remetente === 'cliente' ? '0px 15px 15px 15px' : '15px 15px 0px 15px', 
              // Somente criar um sombra aoo redor, sem mudar a cor original (branca, nesse caso)
              boxShadow: '0px 1px 3px rgba(0,0,0,0.2)',
              wordBreak: 'break-word'
            }}
          >
            <Typography variant="body2">{msg.texto}</Typography>
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, color: 'gray' }}>
              {msg.hora}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* INPUT (barra de escrever msg)*/} 
      <Box sx={{ p: 2, bgcolor: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          fullWidth
          placeholder="Digite sua mensagem..."
          size="small"
          value={mensagem}
          onChange={(evento) => setMensagem(evento.target.value)} /*essa parte serve para mudar o que ta escrito na barra de digitação*/
          onKeyDown={(evento) => evento.key === 'Enter' && enviarMensagem()} //enviar msg com o enter do teclado
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: '25px' } }}
        />
        <IconButton onClick={enviarMensagem} sx={{ bgcolor: '#A3313A', color: 'white', '&:hover': { bgcolor: '#8e2a32' } }}>
          {/* Botão de enviar msg  */}
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
// TelaChatClient, dados vem de la .