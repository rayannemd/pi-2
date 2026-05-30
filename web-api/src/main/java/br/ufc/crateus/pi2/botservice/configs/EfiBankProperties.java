package br.ufc.crateus.pi2.botservice.configs;

import java.math.BigDecimal;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@ConfigurationProperties(prefix = "efi-bank")
public class EfiBankProperties
{
    private String baseUrl;

    private String clientId;

    private String clientSecret;

    private String certificateB64;

    private String certificatePassword;

    private String pixKey;

    private String webhookUrl;

    private int defaultExpirationSeconds = 3600;

    private BigDecimal mockedAmount = new BigDecimal("10.00");
}
