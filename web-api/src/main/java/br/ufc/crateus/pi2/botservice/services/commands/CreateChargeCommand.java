package br.ufc.crateus.pi2.botservice.services.commands;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateChargeCommand
{
    private Long chatId;

    private BigDecimal amount;

    private String description;
}
