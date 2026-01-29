package br.ufc.crateus.pi2.botservice.services;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import br.ufc.crateus.pi2.botservice.controllers.exceptions.DuplicatedResourceException;
import br.ufc.crateus.pi2.botservice.models.Chat;
import br.ufc.crateus.pi2.botservice.models.User;
import br.ufc.crateus.pi2.botservice.repositories.UserRepository;
import br.ufc.crateus.pi2.botservice.services.commands.CreateUserCommand;
import br.ufc.crateus.pi2.botservice.services.commands.UpdateUserCommand;

@Service
public class UserService 
{
    @Autowired
    private final UserRepository userRepository;

    private final PasswordEncoder encoder;
    
    public UserService(
        UserRepository userRepository,
        PasswordEncoder encoder) 
    {
        this.userRepository = userRepository;
        this.encoder = encoder;
    }

    public List<User> getAll() 
    {
        return (List<User>) userRepository.findAll();
    }

    public Optional<User> getById(Long id) 
    {
        return userRepository.findById(id);
    }

    public Set<br.ufc.crateus.pi2.botservice.models.Service> getUserServices(Long id) 
    {
        var user = userRepository.findById(id);

        if(user.isEmpty()) 
            return null;

        return user.get().getServices();
    }

    public List<Chat> getUserChats(Long id) 
    {
        var user = userRepository.findById(id);

        if(user.isEmpty()) 
            return null;

        return user.get().getChats();
    }
    
    public User add(CreateUserCommand command) 
    {
        if (userRepository.existsByCpfCnpj(command.getCpfCnpj()))
            throw new DuplicatedResourceException();

        User newUser = command.toUser();
        newUser.setPassword(encoder.encode(newUser.getPassword()));

        userRepository.save(newUser);
        return newUser;
    }

    public User update(Long id, UpdateUserCommand command) 
    {
        var existingUser = getById(id);

        if(existingUser == null) 
            return null;

        var userToUpdate = existingUser.get();
        userToUpdate.setName(command.getName());
        userToUpdate.setEmail(command.getEmail());
        userToUpdate.setType(command.getType());

        userRepository.save(userToUpdate);
        return userToUpdate;
    }

    public void delete(Long id) 
    {
        var user = getById(id);

        if(user.isPresent()) 
        {
            user.get().softDelete();
            userRepository.save(user.get());
        }
    }
}
