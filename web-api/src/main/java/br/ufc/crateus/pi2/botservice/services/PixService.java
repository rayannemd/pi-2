package br.ufc.crateus.pi2.botservice.services;

import org.springframework.stereotype.Service;

import org.springframework.web.reactive.function.client.WebClient;

import br.ufc.crateus.pi2.botservice.dto.Cobranca;
import br.ufc.crateus.pi2.botservice.dto.CobrancaResponse;


@Service
public class PixService {
    private final WebClient webClient;

    public PixService(WebClient webClient){
        this.webClient = webClient;
    }

    // o token vou receber depois da autenticacao
    public CobrancaResponse fazerCobranca(Cobranca cobranca , String txid , String token){
        return webClient.put().uri("/v2/cob/{txid}" , txid).header("Authorization", "Bearer " + token).bodyValue(cobranca).retrieve().bodyToMono(CobrancaResponse.class).block();
    }

    public CobrancaResponse consultarCobranca(String txid , String token){
        return webClient.get().uri("/v2/cob/{txid}" , txid).header("Authorization" , "Bearer " + token).retrieve().bodyToMono(CobrancaResponse.class).block();
    }
}
