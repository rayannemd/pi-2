package br.ufc.crateus.pi2.botservice.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.ufc.crateus.pi2.botservice.models.Chat;
import br.ufc.crateus.pi2.botservice.models.Message;
import br.ufc.crateus.pi2.botservice.services.ChatService;
import br.ufc.crateus.pi2.botservice.services.MessageService;
import br.ufc.crateus.pi2.botservice.services.commands.SendMessageCommand;
import br.ufc.crateus.pi2.botservice.services.commands.UpdateChatCommand;
import br.ufc.crateus.pi2.botservice.services.dtos.AgentHandledResponseDto;
import br.ufc.crateus.pi2.botservice.services.external.AgentExternalService;
//@CrossOrigin(origins = "http://localhost:5173")

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

    @GetMapping
    public ResponseEntity<List<Chat>> getAllChats() 
    {
        return ResponseEntity.ok(
            chatService.getAll());
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
    public ResponseEntity<AgentHandledResponseDto> sendMessageToAgent(@PathVariable Long id, @RequestBody SendMessageCommand command)
    {
        AgentHandledResponseDto response = agentExternalService.sendMessage(id, command);

        if(response == null)
            return ResponseEntity.notFound().build();
        else
            return ResponseEntity.ok(response);
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Chat> deleteChat(@PathVariable Long id)
    {
        chatService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
