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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.ufc.crateus.pi2.botservice.models.Chat;
import br.ufc.crateus.pi2.botservice.services.ChatService;
import br.ufc.crateus.pi2.botservice.services.commands.CreateChatCommand;
import br.ufc.crateus.pi2.botservice.services.commands.SendMessageCommand;
import br.ufc.crateus.pi2.botservice.services.commands.UpdateChatCommand;
import br.ufc.crateus.pi2.botservice.services.dtos.AgentHandledResponseDto;
import br.ufc.crateus.pi2.botservice.services.external.AgentExternalService;

// Ajuste temporário de cors para o navegador permitir o front de acessar a resposta de login do back
import org.springframework.web.bind.annotation.CrossOrigin;
@CrossOrigin(origins = "http://localhost:5173")

@RestController
@RequestMapping("api/chats")
public class ChatController 
{
    @Autowired
    private ChatService chatService;
    
    @Autowired
    private AgentExternalService agentExternalService;

    @GetMapping
    public ResponseEntity<List<Chat>> getAllChats() 
    {
        List<Chat> chats = chatService.getAll();
        return ResponseEntity.ok(chats);
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

    @PostMapping
    public HttpStatus createChat(@RequestBody CreateChatCommand command) 
    {
        chatService.add(command);
        return HttpStatus.CREATED;
    }
    
    @PostMapping("/{id}/message")
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
    public HttpStatus deleteChat(@PathVariable Long id) 
    {
        chatService.delete(id);
        return HttpStatus.NO_CONTENT;
    }
}
