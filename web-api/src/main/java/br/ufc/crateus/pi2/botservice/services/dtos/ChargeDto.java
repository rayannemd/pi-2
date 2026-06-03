package br.ufc.crateus.pi2.botservice.services.dtos;

import java.math.BigDecimal;
import java.time.Instant;

import br.ufc.crateus.pi2.botservice.models.Charge;
import br.ufc.crateus.pi2.botservice.models.enums.EChargeStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChargeDto
{
    private String txid;

    private BigDecimal amount;

    private EChargeStatus status;

    private String copyPaste;

    private Integer expirationSeconds;

    private Instant paidAt;

    public static ChargeDto from(Charge charge)
    {
        return new ChargeDto(
            charge.getTxid(),
            charge.getAmount(),
            charge.getStatus(),
            charge.getCopyPaste(),
            charge.getExpirationSeconds(),
            charge.getPaidAt());
    }
}
