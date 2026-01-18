package br.ufc.crateus.pi2.botservice.repositories;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import br.ufc.crateus.pi2.botservice.models.User;

public interface UserRepository extends JpaRepository<User, Long> 
{
    Optional<User> findByEmail(String email);

    Optional<User> findByName(String name);
}
