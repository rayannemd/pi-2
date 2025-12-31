package br.ufc.crateus.pi2.botservice.services;

import org.springframework.security.crypto.password.PasswordEncoder;

public class AuthenticationService 
{
    public final PasswordEncoder enconder;

    public AuthenticationService(PasswordEncoder enconder) 
    {
        this.enconder = enconder;
    }
}
