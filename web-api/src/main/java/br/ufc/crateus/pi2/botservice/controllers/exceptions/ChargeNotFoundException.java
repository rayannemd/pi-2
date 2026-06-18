package br.ufc.crateus.pi2.botservice.controllers.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class ChargeNotFoundException extends RuntimeException
{
    public ChargeNotFoundException()
    {
        super("Cobrança não encontrada.");
    }

    public ChargeNotFoundException(String message)
    {
        super(message);
    }
}
