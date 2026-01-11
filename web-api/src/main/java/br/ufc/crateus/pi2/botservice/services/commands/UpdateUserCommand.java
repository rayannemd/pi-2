package br.ufc.crateus.pi2.botservice.services.commands;

import java.util.Set;

import br.ufc.crateus.pi2.botservice.models.Address;
import br.ufc.crateus.pi2.botservice.models.Service;
import br.ufc.crateus.pi2.botservice.models.enums.EUserType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class UpdateUserCommand 
{
    private String name;

    private String email;

    private EUserType userType;

    private Address address;
    
    private Set<Service> services;
}
