package br.ufc.crateus.pi2.botservice.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.ufc.crateus.pi2.botservice.controllers.exceptions.UserNotFoundException;
import br.ufc.crateus.pi2.botservice.models.User;
import br.ufc.crateus.pi2.botservice.services.UserService;
import br.ufc.crateus.pi2.botservice.services.commands.UpdateUserCommand;

@RestController
@RequestMapping("api/users")
public class UserController 
{
    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() 
    {
        List<User> users = userService.getAll();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) 
    {
        if(id == null)
            return ResponseEntity.badRequest().build();

        Optional<User> user = userService.getById(id);

        if(user.isEmpty()) 
            return ResponseEntity.notFound().build();
        else
            return ResponseEntity.ok(user.get());
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody UpdateUserCommand user) 
        throws UserNotFoundException
    {
        if(id == null || user == null)
            return ResponseEntity.badRequest().build();

        User updatedUser = userService.update(id, user);

        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) 
        throws UserNotFoundException
    {
        if(id == null)
            return ResponseEntity.badRequest().build();
        
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
