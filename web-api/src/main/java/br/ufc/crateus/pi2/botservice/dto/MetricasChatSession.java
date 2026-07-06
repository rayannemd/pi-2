package br.ufc.crateus.pi2.botservice.dto;

import lombok.Data;

@Data
public class MetricasChatSession {
    private Integer totalAtendimentos;
    private Integer totalMensagensEnviadas;
    private Integer totalMensagensRecebidas;
    private Double porcentagemSucesso;
    private Double mediaAvaliacao;
}
