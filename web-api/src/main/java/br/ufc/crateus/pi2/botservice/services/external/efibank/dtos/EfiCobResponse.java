package br.ufc.crateus.pi2.botservice.services.external.efibank.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class EfiCobResponse
{
    private EfiCalendar calendario;

    @JsonProperty("devedor")
    private EfiDebtor debtor;

    private EfiAmount valor;

    private String chave;

    private String solicitacaoPagador;

    private String txid;

    private Integer revisao;

    private String status;

    private String pixCopiaECola;

    public boolean isConcluded()
    {
        return "CONCLUIDA".equalsIgnoreCase(status);
    }
}
