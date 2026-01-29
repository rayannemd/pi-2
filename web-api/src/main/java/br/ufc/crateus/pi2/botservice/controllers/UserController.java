package br.ufc.crateus.pi2.botservice.controllers;

import java.util.List;
import java.util.Set;

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
import br.ufc.crateus.pi2.botservice.models.Service;
import br.ufc.crateus.pi2.botservice.models.User;
import br.ufc.crateus.pi2.botservice.services.ChatService;
import br.ufc.crateus.pi2.botservice.services.UserService;
import br.ufc.crateus.pi2.botservice.services.commands.CreateChatCommand;
import br.ufc.crateus.pi2.botservice.services.commands.UpdateUserCommand;

@RestController
@RequestMapping("api/users")
public class UserController 
{
    @Autowired
    private UserService userService;
    
    @Autowired
    private ChatService chatService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() 
    {
        return ResponseEntity.ok(
            userService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) 
    {
        var user = userService.getById(id);

        if(user.isEmpty()) 
            return ResponseEntity.notFound().build();
        else
            return ResponseEntity.ok(user.get());
    }

    @GetMapping("/{id}/services")
    public Set<Service> getUserServices(@PathVariable Long id) 
    {
        return userService.getUserServices(id);
    }

    @GetMapping("/{id}/chats")
    public List<Chat> getUserChats(@PathVariable Long id) 
    {
        return userService.getUserChats(id);
    }

    @PostMapping("/{id}/chats")
    public ResponseEntity<Chat> createChat(@PathVariable Long id, @RequestBody CreateChatCommand command)
    {
        var chat = chatService.add(id, command);
        return new ResponseEntity<>(chat, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody UpdateUserCommand command) 
    {
        User updatedUser = userService.update(id, command);

        if(updatedUser == null)
            return ResponseEntity.notFound().build();
        else
            return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<User> deleteUser(@PathVariable Long id)
    {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
