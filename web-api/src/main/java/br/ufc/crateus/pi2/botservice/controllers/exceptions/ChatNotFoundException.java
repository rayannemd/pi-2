package br.ufc.crateus.pi2.botservice.controllers.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ChatNotFoundException extends RuntimeException 
{
    public ChatNotFoundException() 
    {
        super("Chat não encontrado.");
    }

    public ChatNotFoundException(String message)
    {
        super(message);
    }
}
