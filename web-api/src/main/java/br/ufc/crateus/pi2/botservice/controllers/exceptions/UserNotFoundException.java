package br.ufc.crateus.pi2.botservice.controllers.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class UserNotFoundException extends RuntimeException 
{
    public UserNotFoundException() 
    {
        super("Usuário não encontrado.");
    }

    public UserNotFoundException(String message) 
    {
        super(message);
    }
}