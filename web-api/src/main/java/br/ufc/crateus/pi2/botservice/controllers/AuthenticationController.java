package br.ufc.crateus.pi2.botservice.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;

import br.ufc.crateus.pi2.botservice.controllers.dtos.LoginResponseDto;
import br.ufc.crateus.pi2.botservice.controllers.exceptions.InvalidPasswordException;
import br.ufc.crateus.pi2.botservice.controllers.exceptions.UserNotFoundException;
import br.ufc.crateus.pi2.botservice.controllers.exceptions.DuplicatedResourceException;
import br.ufc.crateus.pi2.botservice.services.AuthenticationService;
import br.ufc.crateus.pi2.botservice.services.UserService;
import br.ufc.crateus.pi2.botservice.services.commands.CreateUserCommand;
import br.ufc.crateus.pi2.botservice.services.commands.LoginCommand;

// Ajuste temporário de cors para o navegador permitir o front de acessar a resposta de login do back
import org.springframework.web.bind.annotation.CrossOrigin;
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
        /* Código original 
        if(command == null)
            return ResponseEntity.badRequest().build();

        return new ResponseEntity<>(authenticationService.login(command), HttpStatus.OK);
        */

        // login fake 
        if(command == null)
            return ResponseEntity.badRequest().build();

        if ( "teste@gmail.com".equals(command.getEmail()) && "123456".equals(command.getPassword()) ) { 
            LoginResponseDto response = new LoginResponseDto( command.getEmail(), "Usuário Teste", "token_fake_123", null );
            return ResponseEntity.ok(response); 
        } 
        // credenciais inválidas 
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PostMapping()
    public ResponseEntity<Void> createUser(@Valid @RequestBody CreateUserCommand command)
       throws DuplicatedResourceException
    {
        if(command == null)
            return ResponseEntity.badRequest().build();

        userService.add(command);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}