package br.ufc.crateus.pi2.botservice.services.external.efibank;

import java.util.Map;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import br.ufc.crateus.pi2.botservice.configs.EfiBankWebClientConfig;
import br.ufc.crateus.pi2.botservice.services.external.efibank.dtos.EfiCobRequest;
import br.ufc.crateus.pi2.botservice.services.external.efibank.dtos.EfiCobResponse;
import reactor.core.publisher.Mono;

@Service
public class EfiBankClient
{
    private static final String COB_BASE_PATH = "/v2/cob";
    private static final String COB_BY_TXID_PATH = "/v2/cob/{txid}";
    private static final String WEBHOOK_PATH = "/v2/webhook/{pixKey}";

    private final WebClient webClient;
    private final EfiBankAuthService authService;

    public EfiBankClient(
        @Qualifier(EfiBankWebClientConfig.EFI_BANK_WEB_CLIENT) WebClient webClient,
        EfiBankAuthService authService)
    {
        this.webClient = webClient;
        this.authService = authService;
    }

    public EfiCobResponse createCob(EfiCobRequest request)
    {
        return webClient.post()
            .uri(COB_BASE_PATH)
            .header(HttpHeaders.AUTHORIZATION, bearer())
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(request)
            .retrieve()
            .bodyToMono(EfiCobResponse.class)
            .onErrorResume(WebClientResponseException.class, ex -> enrich("POST /v2/cob", ex))
            .block();
    }

    public EfiCobResponse getCob(String txid)
    {
        return webClient.get()
            .uri(COB_BY_TXID_PATH, txid)
            .header(HttpHeaders.AUTHORIZATION, bearer())
            .retrieve()
            .bodyToMono(EfiCobResponse.class)
            .onErrorResume(WebClientResponseException.class, ex -> enrich("GET /v2/cob/" + txid, ex))
            .block();
    }

    public void setupWebhook(String pixKey, String webhookUrl)
    {
        webClient.put()
            .uri(WEBHOOK_PATH, pixKey)
            .header(HttpHeaders.AUTHORIZATION, bearer())
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(Map.of("webhookUrl", webhookUrl))
            .retrieve()
            .toBodilessEntity()
            .onErrorResume(WebClientResponseException.class, ex -> enrich("PUT /v2/webhook/" + pixKey, ex))
            .block();
    }

    private String bearer()
    {
        return "Bearer " + authService.getAccessToken();
    }

    private <T> Mono<T> enrich(String op, WebClientResponseException ex)
    {
        return Mono.error(new RuntimeException(
            "Efi " + op + " falhou: " + ex.getStatusCode()
                + " body=" + ex.getResponseBodyAsString(),
            ex));
    }
}
