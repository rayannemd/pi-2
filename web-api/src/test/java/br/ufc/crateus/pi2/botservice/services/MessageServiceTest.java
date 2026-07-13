package br.ufc.crateus.pi2.botservice.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import br.ufc.crateus.pi2.botservice.controllers.dtos.ChatMessageDTO;
import br.ufc.crateus.pi2.botservice.models.Chat;
import br.ufc.crateus.pi2.botservice.models.Message;
import br.ufc.crateus.pi2.botservice.models.enums.EMessageIssuer;
import br.ufc.crateus.pi2.botservice.repositories.ChatRepository;
import br.ufc.crateus.pi2.botservice.repositories.MessageRepository;

/**
 * Testes unitários para MessageService.
 * MessageService usa injeção por campo (@Autowired), então o Mockito injeta
 * os mocks diretamente nos campos privados via @InjectMocks.
 */
@ExtendWith(MockitoExtension.class)
class MessageServiceTest {

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private ChatRepository chatRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private MessageService messageService;

    @Test
    void getMessagesByChatId_deveDelegarParaRepositorio() {
        Message m1 = new Message();
        m1.setContent("Olá");

        when(messageRepository.findByChatId(7L)).thenReturn(List.of(m1));

        List<Message> result = messageService.getMessagesByChatId(7L);

        assertThat(result).containsExactly(m1);
    }

    @Test
    void save_deveSalvarMensagemEAtualizarUltimaMensagemDoChat_quandoChatExistir() {
        Chat chat = new Chat();
        chat.setId(3L);

        ChatMessageDTO dto = new ChatMessageDTO("Olá, tudo bem?", EMessageIssuer.USER, chat);

        when(messageRepository.save(any(Message.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Message saved = messageService.save(dto);

        assertThat(saved.getContent()).isEqualTo("Olá, tudo bem?");
        assertThat(saved.getIssuer()).isEqualTo(EMessageIssuer.USER);
        assertThat(saved.getChat()).isEqualTo(chat);

        // O chat deve ficar com a última mensagem sincronizada e ser persistido
        assertThat(chat.getLastMessage()).isEqualTo("Olá, tudo bem?");
        verify(chatRepository, times(1)).save(chat);

        // Deve publicar tanto a mensagem quanto o aviso de atualização da lista de chats
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/chat/3"), eq(dto));
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/chats/atualizacao"), eq(3L));
    }

    @Test
    void save_naoDeveTocarChatNemWebSocket_quandoChatForNulo() {
        ChatMessageDTO dto = new ChatMessageDTO("Mensagem solta", EMessageIssuer.AGENT, null);

        when(messageRepository.save(any(Message.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Message saved = messageService.save(dto);

        assertThat(saved.getContent()).isEqualTo("Mensagem solta");
        verify(chatRepository, never()).save(any(Chat.class));
        verify(messagingTemplate, never()).convertAndSend(any(String.class), any(Object.class));
    }
}