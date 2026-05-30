package br.ufc.crateus.pi2.botservice;

import java.io.IOException;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.reactive.function.client.WebClient;

import br.ufc.crateus.pi2.botservice.services.external.efibank.EfiBankAuthService;
import br.ufc.crateus.pi2.botservice.services.external.efibank.EfiBankClient;
import br.ufc.crateus.pi2.botservice.services.external.efibank.dtos.EfiAmount;
import br.ufc.crateus.pi2.botservice.services.external.efibank.dtos.EfiCalendar;
import br.ufc.crateus.pi2.botservice.services.external.efibank.dtos.EfiCobRequest;
import br.ufc.crateus.pi2.botservice.services.external.efibank.dtos.EfiCobResponse;
import br.ufc.crateus.pi2.botservice.services.external.efibank.dtos.EfiDebtor;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;

@ExtendWith(MockitoExtension.class)
public class EfiBankClientTest
{
    private MockWebServer mockWebServer;
    private EfiBankClient efiBankClient;

    @BeforeEach
    public void setup() throws IOException
    {
        mockWebServer = new MockWebServer();
        mockWebServer.start();

        WebClient webClient = WebClient.builder()
            .baseUrl(mockWebServer.url("/").toString())
            .build();

        EfiBankAuthService authService = Mockito.mock(EfiBankAuthService.class);
        Mockito.when(authService.getAccessToken()).thenReturn("fake-token");

        efiBankClient = new EfiBankClient(webClient, authService);
    }

    @AfterEach
    public void tearDown() throws IOException
    {
        mockWebServer.shutdown();
    }

    @Test
    public void shouldCreateChargeSuccessfully()
    {
        mockWebServer.enqueue(new MockResponse()
            .setBody("{\"status\": \"ATIVA\", \"txid\": \"abcd\", \"pixCopiaECola\": \"00020126...\"}")
            .addHeader("Content-Type", "application/json"));

        EfiCobRequest request = new EfiCobRequest(
            new EfiCalendar(3600),
            EfiDebtor.ofCpf("Maria", "12345678910"),
            new EfiAmount("2.00"),
            "987654321",
            "Pagamento via chat");

        EfiCobResponse response = efiBankClient.createCob(request);

        Assertions.assertEquals("ATIVA", response.getStatus());
        Assertions.assertEquals("abcd", response.getTxid());
    }

    @Test
    public void shouldGetChargeSuccessfully()
    {
        mockWebServer.enqueue(new MockResponse()
            .setBody("{\"status\": \"CONCLUIDA\", \"txid\": \"abcd\"}")
            .addHeader("Content-Type", "application/json"));

        EfiCobResponse response = efiBankClient.getCob("abcd");

        Assertions.assertEquals("CONCLUIDA", response.getStatus());
        Assertions.assertTrue(response.isConcluded());
    }
}
