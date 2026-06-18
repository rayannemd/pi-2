package br.ufc.crateus.pi2.botservice.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.ufc.crateus.pi2.botservice.services.ChargeService;
import br.ufc.crateus.pi2.botservice.services.external.efibank.dtos.EfiPixWebhookEvent;
import br.ufc.crateus.pi2.botservice.services.external.efibank.dtos.EfiPixWebhookPayload;

@RestController
@RequestMapping("/api/webhooks/efi-bank")
public class WebhookController
{
    @Autowired
    private ChargeService chargeService;

    @PostMapping({"", "/pix"})
    public ResponseEntity<Void> receivePixWebhook(@RequestBody EfiPixWebhookPayload payload)
    {
        for (EfiPixWebhookEvent event : payload.getPix())
        {
            if (event.getTxid() == null || event.getTxid().isBlank())
                continue;

            try
            {
                chargeService.markAsPaid(event.getTxid());
            }
            catch (Exception ignored)
            {
            }
        }

        return ResponseEntity.ok().build();
    }
}
