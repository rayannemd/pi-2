package br.ufc.crateus.pi2.botservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.ufc.crateus.pi2.botservice.models.Service;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long>
{
}
