package br.ufc.crateus.pi2.botservice.models;

import java.math.BigDecimal;
import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonIgnore;

import br.ufc.crateus.pi2.botservice.models.enums.EInstallmentStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Mensalidade de um plano (Service) de um usuário.
 * Os dados são mockados e gerados pelo seeder ao subir o container; o fluxo, porém, é real:
 * o usuário escolhe quais mensalidades em aberto pagar e a cobrança é o somatório dos valores.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Installment extends BaseEntity
{
    @Id
    @Column(unique = true)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    private Service service;

    @Column(nullable = false, length = 7)
    private String referenceMonth;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EInstallmentStatus status = EInstallmentStatus.OPEN;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    private Charge charge;

    private Instant paidAt;
}
