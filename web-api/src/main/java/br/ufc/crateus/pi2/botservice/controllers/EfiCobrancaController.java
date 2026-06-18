package br.ufc.crateus.pi2.botservice.controllers;

import java.net.http.HttpRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.ufc.crateus.pi2.botservice.dto.EfiCobranca;
import br.ufc.crateus.pi2.botservice.dto.EfiCobrancaResponse;
import br.ufc.crateus.pi2.botservice.services.EfiCobrancaService;

@RestController
@RequestMapping("/v2/cob")
public class EfiCobrancaController {
    private final EfiCobrancaService pixService;

    public EfiCobrancaController(EfiCobrancaService pixService) {
        this.pixService = pixService;
    }

    @PutMapping("/{txid}")
    public ResponseEntity<EfiCobrancaResponse> fazerCobranca(@RequestBody EfiCobranca cobranca, @PathVariable String txid,
            @RequestHeader String token) {
        return ResponseEntity.ok(pixService.fazerCobranca(cobranca, txid, token));
    }

    @GetMapping("/{txid}")
    public ResponseEntity<EfiCobrancaResponse> consultarCobranca(@PathVariable String txid, @RequestHeader String token) {
        return ResponseEntity.ok(pixService.consultarCobranca(txid, token));
    }
}
