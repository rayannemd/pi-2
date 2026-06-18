package br.ufc.crateus.pi2.botservice.configs;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;

import io.netty.resolver.DefaultAddressResolverGroup;
import reactor.netty.http.client.HttpClient;

@Configuration
public class WebClientConfig 
{   
    @Bean
    public WebClient webClient()
    {
        HttpClient httpClient = HttpClient.create()
            .resolver(DefaultAddressResolverGroup.INSTANCE);

        return WebClient.builder()
            .clientConnector(new ReactorClientHttpConnector(httpClient))
            .build();
    }
}
