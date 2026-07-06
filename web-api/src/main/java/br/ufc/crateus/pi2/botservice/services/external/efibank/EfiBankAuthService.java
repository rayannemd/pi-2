package br.ufc.crateus.pi2.botservice.services.external.efibank;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import br.ufc.crateus.pi2.botservice.configs.EfiBankProperties;
import br.ufc.crateus.pi2.botservice.configs.EfiBankWebClientConfig;
import br.ufc.crateus.pi2.botservice.services.external.efibank.dtos.EfiTokenResponse;
import reactor.util.retry.Retry;

@Service
public class EfiBankAuthService
{
    private static final String TOKEN_PATH = "/oauth/token";
    private static final Duration SAFETY_MARGIN = Duration.ofSeconds(60);

    private final WebClient webClient;
    private final EfiBankProperties properties;

    private volatile String cachedToken;
    private volatile Instant expiresAt = Instant.EPOCH;

    public EfiBankAuthService(
        @Qualifier(EfiBankWebClientConfig.EFI_BANK_WEB_CLIENT) WebClient webClient,
        EfiBankProperties properties)
    {
        this.webClient = webClient;
        this.properties = properties;
    }

    public synchronized String getAccessToken()
    {
        if (cachedToken != null && Instant.now().isBefore(expiresAt))
            return cachedToken;

        EfiTokenResponse response = requestNewToken();

        cachedToken = response.getAccessToken();
        expiresAt = Instant.now().plusSeconds(response.getExpiresIn()).minus(SAFETY_MARGIN);

        return cachedToken;
    }

    private EfiTokenResponse requestNewToken()
    {
        String basic = Base64.getEncoder().encodeToString(
            (properties.getClientId() + ":" + properties.getClientSecret())
                .getBytes(StandardCharsets.UTF_8));

        return webClient.post()
            .uri(TOKEN_PATH)
            .header(HttpHeaders.AUTHORIZATION, "Basic " + basic)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(Map.of("grant_type", "client_credentials"))
            .retrieve()
            .bodyToMono(EfiTokenResponse.class)
            .retryWhen(Retry.backoff(2, Duration.ofSeconds(1)))
            .block();
    }
}
