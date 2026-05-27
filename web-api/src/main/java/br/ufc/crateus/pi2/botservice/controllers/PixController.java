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

import br.ufc.crateus.pi2.botservice.dto.Cobranca;
import br.ufc.crateus.pi2.botservice.dto.CobrancaResponse;
import br.ufc.crateus.pi2.botservice.services.PixService;

@RestController
@RequestMapping("/v2/cob")
public class PixController {
    private final PixService pixService;

    public PixController(PixService pixService) {
        this.pixService = pixService;
    }

    @PutMapping("/{txid}")
    public ResponseEntity<CobrancaResponse> fazerCobranca(@RequestBody Cobranca cobranca, @PathVariable String txid,
            @RequestHeader String token) {
        return ResponseEntity.ok(pixService.fazerCobranca(cobranca, txid, token));
    }

    @GetMapping("/{txid}")
    public ResponseEntity<CobrancaResponse> consultarCobranca(@PathVariable String txid, @RequestHeader String token) {
        return ResponseEntity.ok(pixService.consultarCobranca(txid, token));
    }
}
