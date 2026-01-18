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

import br.ufc.crateus.pi2.botservice.models.Service;
import br.ufc.crateus.pi2.botservice.models.User;
import br.ufc.crateus.pi2.botservice.services.UserService;
import br.ufc.crateus.pi2.botservice.services.commands.CreateUserCommand;
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

    @PostMapping("/{id}/services")
    public HttpStatus addService(@PathVariable Long id, @RequestBody String serviceName) 
    {
        try 
        {
            userService.addService(id, serviceName);
            return HttpStatus.OK;
        } 
        catch (IllegalArgumentException e) 
        {
            return HttpStatus.NOT_FOUND;
        }
    }

    @PostMapping
    public HttpStatus createUser(@RequestBody CreateUserCommand command) 
    {
        userService.add(command);
        return HttpStatus.CREATED;
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
    public HttpStatus deleteUser(@PathVariable Long id) 
    {
        userService.delete(id);
        return HttpStatus.NO_CONTENT;
    }
}
