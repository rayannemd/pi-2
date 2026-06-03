package br.ufc.crateus.pi2.botservice.controllers.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class DuplicatedResourceException extends RuntimeException  {

    public DuplicatedResourceException()
    {
        super("CPF/CNPJ já cadastrado");
    }

    public DuplicatedResourceException(String message)
    {
        super(message);
    }
}
