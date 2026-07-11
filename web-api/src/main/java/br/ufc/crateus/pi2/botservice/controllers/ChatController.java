package br.ufc.crateus.pi2.botservice.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.ufc.crateus.pi2.botservice.controllers.dtos.ChatMessageDTO;
import br.ufc.crateus.pi2.botservice.controllers.exceptions.ChatNotFoundException;
import br.ufc.crateus.pi2.botservice.controllers.exceptions.UserNotFoundException;
import br.ufc.crateus.pi2.botservice.models.Chat;
import br.ufc.crateus.pi2.botservice.models.enums.EChatStatus;
import br.ufc.crateus.pi2.botservice.models.enums.EMessageIssuer;
import br.ufc.crateus.pi2.botservice.models.Message;
import br.ufc.crateus.pi2.botservice.repositories.UserRepository;
import br.ufc.crateus.pi2.botservice.services.ChargeService;
import br.ufc.crateus.pi2.botservice.services.ChatService;
import br.ufc.crateus.pi2.botservice.services.MessageService;
import br.ufc.crateus.pi2.botservice.services.TokenService;
import br.ufc.crateus.pi2.botservice.services.commands.CreateChargeFromInstallmentsCommand;
import br.ufc.crateus.pi2.botservice.services.commands.CreateChatCommand;
import br.ufc.crateus.pi2.botservice.services.commands.RateChatCommand;
import br.ufc.crateus.pi2.botservice.services.commands.SendMessageCommand;
import br.ufc.crateus.pi2.botservice.services.commands.UpdateChatCommand;
import br.ufc.crateus.pi2.botservice.services.dtos.AgentHandledResponseDto;
import br.ufc.crateus.pi2.botservice.services.dtos.ChargeDto;
import br.ufc.crateus.pi2.botservice.services.external.AgentExternalService;

@RestController
@RequestMapping("api/chats")
public class ChatController 
{
    @Autowired
    private ChatService chatService;
    
    @Autowired
    private AgentExternalService agentExternalService;
    
    @Autowired
    private MessageService messageService;

    @Autowired
    private TokenService tokenService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChargeService chargeService;

    @GetMapping
    public ResponseEntity<List<Chat>> getAllChats()
    {
        return ResponseEntity.ok(
            chatService.getAll());
    }

    @PostMapping
    public ResponseEntity<Chat> createChat(
        @RequestHeader("Authorization") String authorization,
        @RequestBody CreateChatCommand command)
    {
        String token = authorization.replaceFirst("(?i)^Bearer\\s+", "");
        String email = tokenService.validateToken(token);

        var user = userRepository.findByEmail(email)
            .orElseThrow(UserNotFoundException::new);

        Chat chat = chatService.add(user.getId(), command);
        return ResponseEntity.ok(chat);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Chat> getChatById(@PathVariable Long id) 
    {
        var chat = chatService.getById(id);

        if(chat.isEmpty()) 
            return ResponseEntity.notFound().build();
        else
            return ResponseEntity.ok(chat.get());
    }

    @GetMapping("/{id}/messages")
    public ResponseEntity<List<Message>> getChatMessages(@PathVariable Long id) 
    {
        return ResponseEntity.ok(
            messageService.getMessagesByChatId(id));
    }
    
    @PostMapping("/{id}/messages")
    public ResponseEntity<AgentHandledResponseDto> sendMessageToAgent(
        @PathVariable Long id,
        @RequestBody SendMessageCommand command)
    {
        Chat chat = chatService.getById(id).orElseThrow(ChatNotFoundException::new);

        if(chat.getChatStatus() == EChatStatus.INTERVIDO){
            messageService.save(new ChatMessageDTO(command.getMessage(), EMessageIssuer.USER, chat));
            return ResponseEntity.ok().build();   
        }

        AgentHandledResponseDto response = agentExternalService.sendMessage(id, command);

        if (response == null)
            return ResponseEntity.notFound().build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/admin-message")
    public ResponseEntity<Void> sendAdminMessage(@PathVariable Long id, @RequestBody SendMessageCommand command)
    {
        Chat chat = chatService.getById(id).orElseThrow(ChatNotFoundException::new);
        ChatMessageDTO dto = new ChatMessageDTO(command.getMessage(), EMessageIssuer.ADMIN, chat);
        messageService.save(dto);

        if(chat.getChatStatus() != EChatStatus.INTERVIDO){
            chatService.updateChatStatus(id, EChatStatus.INTERVIDO);
        }

        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{id}/charges")
    public ResponseEntity<ChargeDto> createCharge(
        @PathVariable Long id,
        @RequestBody CreateChargeFromInstallmentsCommand command)
    {
        if (command == null || command.getInstallmentIds() == null || command.getInstallmentIds().isEmpty())
            return ResponseEntity.badRequest().build();

        try
        {
            ChargeDto charge = chargeService.createForInstallments(id, command.getInstallmentIds());

            Chat chat = chatService.getById(id).orElse(null);
            if (chat != null)
                messageService.save(new ChatMessageDTO(
                    "Gerei sua cobrança Pix de R$ " + charge.getAmount().toPlainString()
                        + ". Use o QR Code ou o copia-e-cola para pagar.",
                    EMessageIssuer.AGENT, chat));

            return ResponseEntity.ok(charge);
        }
        catch (IllegalArgumentException ex)
        {
            return ResponseEntity.badRequest().build();
        }
        catch (RuntimeException ex)
        {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Chat> updateChat(@PathVariable Long id, @RequestBody UpdateChatCommand command)
    {
        Chat updatedChat = chatService.update(id, command);

        if(updatedChat == null)
            return ResponseEntity.notFound().build();
        else
            return ResponseEntity.ok(updatedChat);    
    }

    @PutMapping("/{id}/concluir")
    public ResponseEntity<Void> concluirChat(@PathVariable Long id) 
    {
        chatService.concluirChat(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Chat> deleteChat(@PathVariable Long id)
    {
        chatService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/rating")
    public ResponseEntity<Void> rateChat(
            @PathVariable Long id,
            @RequestBody RateChatCommand command) {

        chatService.rateChat(id, command);
        return ResponseEntity.ok().build();
    }
}
