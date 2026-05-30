package br.ufc.crateus.pi2.botservice.services.external.efibank.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class EfiPixWebhookEvent
{
    private String endToEndId;

    private String txid;

    private String chave;

    private String valor;

    private String horario;

    private String infoPagador;
}
