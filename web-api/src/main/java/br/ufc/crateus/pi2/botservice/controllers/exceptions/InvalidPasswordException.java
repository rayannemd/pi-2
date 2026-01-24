package br.ufc.crateus.pi2.botservice.controllers.exceptions;

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