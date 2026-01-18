package br.ufc.crateus.pi2.botservice.services;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;

import br.ufc.crateus.pi2.botservice.models.Service;
import br.ufc.crateus.pi2.botservice.repositories.ServiceRepository;
import br.ufc.crateus.pi2.botservice.services.commands.CreateServiceCommand;
import br.ufc.crateus.pi2.botservice.services.commands.UpdateServiceCommand;

@org.springframework.stereotype.Service
public class ServiceAppService 
{
    @Autowired
    private final ServiceRepository serviceRepository;

    public ServiceAppService(ServiceRepository serviceRepository) 
    {
        this.serviceRepository = serviceRepository;
    }

    public List<Service> getAll() 
    {
        return (List<Service>) serviceRepository.findAll();
    }

    public Optional<Service> getById(Long id) 
    {
        return serviceRepository.findById(id);
    }

    public Service getByName(String name) 
    {
        return serviceRepository.findByName(name).orElse(null);
    }

    public void add(CreateServiceCommand command) 
    {
        var newService = command.toService();
        serviceRepository.save(newService);
    }

    public Service update(Long id, UpdateServiceCommand command) 
    {
        var existingService = serviceRepository.findById(id);

        if(existingService.isEmpty())
            return null;

        var serviceToUpdate = existingService.get();
        serviceToUpdate.setName(command.getName());
        serviceToUpdate.setDescription(command.getDescription());

        serviceRepository.save(serviceToUpdate);
        return serviceToUpdate;
    }

    public void delete(Long id) 
    {
        var service = serviceRepository.findById(id);

        if(service.isPresent())
        {
            service.get().softDelete();
            serviceRepository.save(service.get());
        }
    }
}
