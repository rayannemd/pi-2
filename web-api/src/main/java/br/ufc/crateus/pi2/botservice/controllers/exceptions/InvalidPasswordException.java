package br.ufc.crateus.pi2.botservice.controllers.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class InvalidPasswordException extends RuntimeException 
{
    public InvalidPasswordException() 
    {
        super("Senha inválida.");
    }
    
    public InvalidPasswordException(String message) 
    {
        super(message);
    }
}