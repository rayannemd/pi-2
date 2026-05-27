package br.ufc.crateus.pi2.botservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
public class CobrancaResponse {
    private Calendario calendario;
    
    @JsonProperty("devedor")
    private ClienteDTO clienteDTO;

    private Valor valor;

    private String chave;

    private String solicitacaoPagador;

    private String status;

    private String pixCopiaECola;
}
