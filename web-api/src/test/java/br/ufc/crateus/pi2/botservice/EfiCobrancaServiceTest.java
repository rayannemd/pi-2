package br.ufc.crateus.pi2.botservice;

import java.io.IOException;

import org.junit.Test;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.web.reactive.function.client.WebClient;

import br.ufc.crateus.pi2.botservice.dto.EfiCalendario;
import br.ufc.crateus.pi2.botservice.dto.EfiClienteDTO;
import br.ufc.crateus.pi2.botservice.dto.EfiCobranca;
import br.ufc.crateus.pi2.botservice.dto.EfiCobrancaResponse;
import br.ufc.crateus.pi2.botservice.dto.EfiValor;
import br.ufc.crateus.pi2.botservice.services.EfiCobrancaService;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;

@ExtendWith(MockitoExtension.class)
public class EfiCobrancaServiceTest {
    private MockWebServer mockWebServer;
    private EfiCobrancaService efiCobrancaService;

    @BeforeEach
    public void setup() throws IOException{
        mockWebServer = new MockWebServer();
        mockWebServer.start();

        String url = mockWebServer.url("/").toString();
        WebClient webClient = WebClient.builder().baseUrl(url).build();

        efiCobrancaService = new EfiCobrancaService(webClient);
    }

    @AfterEach
    public void tearDown() throws IOException{
        mockWebServer.shutdown();
    }

    @Test
    public void deveFazerCobrancaComSucesso(){
        String resposta = """
                {"status": "ATIVA"}""";

        mockWebServer.enqueue(new MockResponse().setBody(resposta).addHeader("Content-Type", "application/json"));

        EfiCobrancaResponse resp = efiCobrancaService.fazerCobranca(new EfiCobranca(new EfiCalendario(360000), new EfiClienteDTO("maria" , "12345678910" , null) , new EfiValor("2.00") , "987654321" , "me paga ai vagabundo") , "abcd" , "mjklmj" );

        Assertions.assertEquals("ATIVA", resp.getStatus());
    }

    @Test
    public void deveConsultarCobrancaComSucesso(){
        String resposta = """
                {"status": "ATIVA"}""";
        mockWebServer.enqueue(new MockResponse().setBody(resposta).addHeader("Content-Type", "application/json"));
        EfiCobrancaResponse resp = efiCobrancaService.consultarCobranca("abcd", "deusehbom");

        Assertions.assertEquals("ATIVA", resp.getStatus());
    }
}
