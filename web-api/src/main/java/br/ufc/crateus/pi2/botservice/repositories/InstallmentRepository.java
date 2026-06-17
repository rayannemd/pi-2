package br.ufc.crateus.pi2.botservice.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import br.ufc.crateus.pi2.botservice.models.Installment;
import br.ufc.crateus.pi2.botservice.models.enums.EInstallmentStatus;

@Repository
public interface InstallmentRepository extends JpaRepository<Installment, Long>
{
    List<Installment> findByUserIdAndStatusOrderByReferenceMonth(Long userId, EInstallmentStatus status);

    List<Installment> findByChargeId(Long chargeId);

    boolean existsByUserId(Long userId);
}
