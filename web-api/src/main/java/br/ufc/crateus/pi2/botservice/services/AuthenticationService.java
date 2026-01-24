package br.ufc.crateus.pi2.botservice.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import br.ufc.crateus.pi2.botservice.controllers.dtos.LoginResponseDto;
import br.ufc.crateus.pi2.botservice.controllers.exceptions.InvalidPasswordException;
import br.ufc.crateus.pi2.botservice.controllers.exceptions.UserNotFoundException;
import br.ufc.crateus.pi2.botservice.repositories.UserRepository;
import br.ufc.crateus.pi2.botservice.services.commands.LoginCommand;

@Service
public class AuthenticationService 
{
    @Autowired
    private TokenService tokenService;

    @Autowired
    private UserRepository userRepository;

    public final PasswordEncoder enconder;

    public AuthenticationService(PasswordEncoder enconder) 
    {
        this.enconder = enconder;
    }

    public LoginResponseDto login(LoginCommand command) 
    {
        validateIfUserExists(command.getEmail());

        var user = userRepository.findFirstByEmail(command.getEmail()).get();

        validatePassword(command.getPassword(), user.getPassword());

        String token = tokenService.generateToken(user);

        return LoginResponseDto.fromUser(user, token);
    }

    private void validatePassword(String rawPassword, String encodedPassword) 
    {
        if (!enconder.matches(rawPassword, encodedPassword)) {
            throw new InvalidPasswordException();
        }
    }

    private void validateIfUserExists(String email) 
    {
        var userOpt = userRepository.findFirstByEmail(email);

        if (!userOpt.isPresent() || userOpt.get().getDeleteDate() != null) {
            throw new UserNotFoundException();
        }
    }
}