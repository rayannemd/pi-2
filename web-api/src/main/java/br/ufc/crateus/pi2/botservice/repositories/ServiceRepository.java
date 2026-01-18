package br.ufc.crateus.pi2.botservice.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.ufc.crateus.pi2.botservice.models.Service;

public interface ServiceRepository extends JpaRepository<Service, Long>  
{
    Optional<Service> findByName(String name);
}
