package br.ufc.crateus.pi2.botservice.services;

import java.util.Calendar;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;

import br.ufc.crateus.pi2.botservice.models.User;

@Service
public class TokenService 
{
    @Value("${api.security.token.secret}")
    private String secret;

    public String generateToken(User user) 
    {
        try 
        {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.create()
                    .withIssuer("auth-api")
                    .withSubject(user.getEmail())
                    .withClaim("email", user.getEmail())
                    .withExpiresAt(generateExpirationDate())
                    .sign(algorithm);   
        } 
        catch (JWTCreationException exception)
        {
            throw new RuntimeException("Ocorreu um erro ao gerar o token", exception);
        }
    }

    public String validateToken(String token) {
        try 
        {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                    .withIssuer("auth-api")
                    .build()
                    .verify(token)
                    .getSubject();    
        } 
        catch (JWTVerificationException exception) 
        {
            throw new RuntimeException("Ocorreu um erro ao verificar o token", exception);
        }
    }

    private Date generateExpirationDate() 
    {
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.HOUR, 24);

        return calendar.getTime();
    }
}