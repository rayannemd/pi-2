package br.ufc.crateus.pi2.botservice.services.commands;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateChargeFromInstallmentsCommand
{
    private List<Long> installmentIds;
}
