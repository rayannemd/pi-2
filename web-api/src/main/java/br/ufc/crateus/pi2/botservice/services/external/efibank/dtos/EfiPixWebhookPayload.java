package br.ufc.crateus.pi2.botservice.services.external.efibank.dtos;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class EfiPixWebhookPayload
{
    private List<EfiPixWebhookEvent> pix;
}
