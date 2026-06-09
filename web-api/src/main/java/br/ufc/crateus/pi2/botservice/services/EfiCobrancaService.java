package br.ufc.crateus.pi2.botservice.services;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import org.springframework.web.reactive.function.client.WebClient;

import br.ufc.crateus.pi2.botservice.dto.EfiCobranca;
import br.ufc.crateus.pi2.botservice.dto.EfiCobrancaResponse;


@Service
public class EfiCobrancaService {
    private final WebClient webClient;

    public EfiCobrancaService(@Qualifier("webConfigEfiBank") WebClient webClient){
        this.webClient = webClient;
    }

    // o token vou receber depois da autenticacao
    public EfiCobrancaResponse fazerCobranca(EfiCobranca cobranca , String txid , String token){
        return webClient.put().uri("/v2/cob/{txid}" , txid).header("Authorization", "Bearer " + token).bodyValue(cobranca).retrieve().bodyToMono(EfiCobrancaResponse.class).block();
    }

    public EfiCobrancaResponse consultarCobranca(String txid , String token){
        return webClient.get().uri("/v2/cob/{txid}" , txid).header("Authorization" , "Bearer " + token).retrieve().bodyToMono(EfiCobrancaResponse.class).block();
    }
}
