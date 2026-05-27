package br.ufc.crateus.pi2.botservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Value;

@Value
public class Cobranca {
    private Calendario calendario;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    @JsonProperty("devedor")
    private ClienteDTO clienteDTO;

    private Valor valor;

    private String chave;

    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String solicitacaoPagador;
}
