package br.ufc.crateus.pi2.botservice.repositories;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import br.ufc.crateus.pi2.botservice.models.Charge;

@Repository
public interface ChargeRepository extends CrudRepository<Charge, Long>
{
    Optional<Charge> findByTxid(String txid);
}
