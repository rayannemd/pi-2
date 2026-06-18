package br.ufc.crateus.pi2.botservice.services.dtos;

import java.math.BigDecimal;

import br.ufc.crateus.pi2.botservice.models.Installment;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class InstallmentDto
{
    private Long id;

    private String planName;

    private String referenceMonth;

    private BigDecimal amount;

    public static InstallmentDto from(Installment installment)
    {
        return new InstallmentDto(
            installment.getId(),
            installment.getService() != null ? installment.getService().getName() : null,
            installment.getReferenceMonth(),
            installment.getAmount());
    }
}
