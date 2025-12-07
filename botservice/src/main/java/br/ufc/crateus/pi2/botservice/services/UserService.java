package br.ufc.crateus.pi2.botservice.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import br.ufc.crateus.pi2.botservice.models.Address;
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

    public void add(CreateUserCommand command) 
    {
        User newUser = command.toUser();

        if(newUser.getAddress() != null) 
        {
            Address address = new Address();
            BeanUtils.copyProperties(command.getAddress(), address);

            newUser.setAddress(address);
        }

        newUser.setPassword(encoder.encode(newUser.getPassword()));
        userRepository.save(newUser);
    }

    public User update(Long id, UpdateUserCommand command) 
    {
        User existingUser = getById(id).get();

        if(existingUser == null) 
            return null;

        existingUser.setName(command.getName());
        existingUser.setEmail(command.getEmail());
        existingUser.setUserType(command.getUserType());

        if(command.getServices() != null) 
            existingUser.updateServices(command.getServices());

        if(command.getAddress() != null) 
            existingUser.updateAddress(command.getAddress());

        userRepository.save(existingUser);
        return existingUser;
    }

    public void delete(Long id) 
    {
        User user = getById(id).get();

        if(user != null) 
        {
            user.softDelete();

            if (user.getAddress() != null)
                user.getAddress().softDelete();

            userRepository.save(user);
        }
    }
}
