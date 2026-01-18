package br.ufc.crateus.pi2.botservice.controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.ufc.crateus.pi2.botservice.models.Service;
import br.ufc.crateus.pi2.botservice.services.ServiceAppService;
import br.ufc.crateus.pi2.botservice.services.commands.CreateServiceCommand;
import br.ufc.crateus.pi2.botservice.services.commands.UpdateServiceCommand;

@RestController
@RequestMapping("api/services")
public class ServiceController 
{
    @Autowired
    private ServiceAppService serviceAppService;

    @GetMapping
    public ResponseEntity<List<Service>> getAllServices() 
    {
        List<Service> services = serviceAppService.getAll();
        return ResponseEntity.ok(services);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Service> getServiceById(@PathVariable Long id) 
    {
        var service = serviceAppService.getById(id);
        
        if(service.isEmpty()) 
            return ResponseEntity.notFound().build();
        else
            return ResponseEntity.ok(service.get());
    }

    @PostMapping
    public HttpStatus createService(@RequestBody CreateServiceCommand command) 
    {
        serviceAppService.add(command);
        return HttpStatus.CREATED;
    }

    @PutMapping("/{id}")
    public ResponseEntity<Service> updateService(@PathVariable Long id, @RequestBody UpdateServiceCommand command) 
    {
        Service updatedService = serviceAppService.update(id, command);

        if(updatedService == null)
            return ResponseEntity.notFound().build();
        else
            return ResponseEntity.ok(updatedService);    
    }
    
    @DeleteMapping("/{id}")
    public HttpStatus deleteService(@PathVariable Long id) 
    {
        serviceAppService.delete(id);
        return HttpStatus.NO_CONTENT;
    }
}
