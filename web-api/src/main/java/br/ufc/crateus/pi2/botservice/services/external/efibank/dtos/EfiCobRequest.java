package br.ufc.crateus.pi2.botservice.services.external.efibank.dtos;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EfiCobRequest
{
    private EfiCalendar calendario;

    @JsonProperty("devedor")
    private EfiDebtor debtor;

    private EfiAmount valor;

    private String chave;

    private String solicitacaoPagador;
}
