package br.ufc.crateus.pi2.botservice.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.ufc.crateus.pi2.botservice.controllers.dtos.LoginResponseDto;
import br.ufc.crateus.pi2.botservice.controllers.exceptions.DuplicatedResourceException;
import br.ufc.crateus.pi2.botservice.controllers.exceptions.InvalidPasswordException;
import br.ufc.crateus.pi2.botservice.controllers.exceptions.UserNotFoundException;
import br.ufc.crateus.pi2.botservice.models.User;
import br.ufc.crateus.pi2.botservice.services.AuthenticationService;
import br.ufc.crateus.pi2.botservice.services.UserService;
import br.ufc.crateus.pi2.botservice.services.commands.CreateUserCommand;
import br.ufc.crateus.pi2.botservice.services.commands.LoginCommand;
import jakarta.validation.Valid;
@CrossOrigin(origins = "http://localhost:5173")

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController 
{
    @Autowired
    private AuthenticationService authenticationService;
    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginCommand command)
        throws UserNotFoundException, InvalidPasswordException
    {

        if(command == null)
            return ResponseEntity.badRequest().build();

        return new ResponseEntity<>(authenticationService.login(command), HttpStatus.OK);
    }

    @PostMapping()
    public ResponseEntity<User> createUser(@Valid @RequestBody CreateUserCommand command)
       throws DuplicatedResourceException
    {
        if(command == null)
            return ResponseEntity.badRequest().build();

        var user = userService.add(command);
        return new ResponseEntity<>(user, HttpStatus.CREATED);
    }
}