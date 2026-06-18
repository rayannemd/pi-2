package br.ufc.crateus.pi2.botservice.configs;

import java.io.ByteArrayInputStream;
import java.security.KeyStore;
import java.time.Duration;
import java.util.Base64;

import javax.net.ssl.KeyManagerFactory;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;

import io.netty.handler.ssl.SslContext;
import io.netty.handler.ssl.SslContextBuilder;
import io.netty.resolver.DefaultAddressResolverGroup;
import reactor.netty.http.client.HttpClient;

@Configuration
public class EfiBankWebClientConfig
{
    public static final String EFI_BANK_WEB_CLIENT = "efiBankWebClient";

    @Bean(EFI_BANK_WEB_CLIENT)
    public WebClient efiBankWebClient(EfiBankProperties properties) throws Exception
    {
        SslContext sslContext = buildMutualTlsContext(properties);

        HttpClient httpClient = HttpClient.create()
            .resolver(DefaultAddressResolverGroup.INSTANCE)
            .secure(spec -> spec.sslContext(sslContext))
            .responseTimeout(Duration.ofSeconds(30));

        return WebClient.builder()
            .baseUrl(properties.getBaseUrl())
            .clientConnector(new ReactorClientHttpConnector(httpClient))
            .build();
    }

    private SslContext buildMutualTlsContext(EfiBankProperties properties) throws Exception
    {
        byte[] p12Bytes = Base64.getDecoder().decode(properties.getCertificateB64());
        char[] password = properties.getCertificatePassword() == null
            ? new char[0]
            : properties.getCertificatePassword().toCharArray();

        KeyStore keyStore = KeyStore.getInstance("PKCS12");
        try (ByteArrayInputStream in = new ByteArrayInputStream(p12Bytes))
        {
            keyStore.load(in, password);
        }

        KeyManagerFactory kmf = KeyManagerFactory.getInstance(KeyManagerFactory.getDefaultAlgorithm());
        kmf.init(keyStore, password);

        return SslContextBuilder.forClient()
            .keyManager(kmf)
            .build();
    }
}
