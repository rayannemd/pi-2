package br.ufc.crateus.pi2.botservice.dto;

import lombok.Data;

@Data
public class MetricasChatSession {
    private Integer totalAtendimentos;
    private Integer totalMensagensEnviadas;
    private Integer totalMensagensRecebidas;
    private Double porcentagemSucesso;
    private Double mediaAvaliacao;
    private Integer totalChatsNota1;
    private Integer totalChatsNota2;
    private Integer totalChatsNota3;
    private Integer totalChatsNota4;
    private Integer totalChatsNota5;
}
