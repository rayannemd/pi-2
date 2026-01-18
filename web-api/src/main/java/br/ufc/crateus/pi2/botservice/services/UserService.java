package br.ufc.crateus.pi2.botservice.services;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import br.ufc.crateus.pi2.botservice.models.Address;
import br.ufc.crateus.pi2.botservice.models.User;
import br.ufc.crateus.pi2.botservice.repositories.ServiceRepository;
import br.ufc.crateus.pi2.botservice.repositories.UserRepository;
import br.ufc.crateus.pi2.botservice.services.commands.CreateUserCommand;
import br.ufc.crateus.pi2.botservice.services.commands.UpdateUserCommand;

@Service
public class UserService 
{
    @Autowired
    private final UserRepository userRepository;

    @Autowired
    private final ServiceRepository serviceRepository;

    private final PasswordEncoder encoder;
    
    public UserService(
        UserRepository userRepository,
        PasswordEncoder encoder,
        ServiceRepository serviceRepository) 
    {
        this.userRepository = userRepository;
        this.encoder = encoder;
        this.serviceRepository = serviceRepository;
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

    public void addService(Long id, String serviceName) 
    {
        var user = userRepository.findById(id);
        Assert.notNull(user, "O usuário não foi encontrado.");

        var service = serviceRepository.findByName(serviceName);
        Assert.notNull(service, "O serviço não foi encontrado.");
        
        user.get().addService(service.get());
        userRepository.save(user.get());
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
        var existingUser = getById(id);

        if(existingUser == null) 
            return null;

        var userToUpdate = existingUser.get();
        userToUpdate.setName(command.getName());
        userToUpdate.setEmail(command.getEmail());
        userToUpdate.setType(command.getType());

        if(command.getAddress() != null) 
            userToUpdate.updateAddress(command.getAddress());

        userRepository.save(userToUpdate);
        return userToUpdate;
    }

    public void delete(Long id) 
    {
        var user = getById(id);

        if(user.isPresent()) 
        {
            user.get().softDelete();
            if (user.get().getAddress() != null)
                user.get().getAddress().softDelete();

            userRepository.save(user.get());
        }
    }
}
