package br.ufc.crateus.pi2.botservice.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import br.ufc.crateus.pi2.botservice.dto.MetricasChatSession;
import br.ufc.crateus.pi2.botservice.models.enums.EChatStatus;
import br.ufc.crateus.pi2.botservice.models.enums.EMessageIssuer;
import br.ufc.crateus.pi2.botservice.repositories.ChatRepository;
import br.ufc.crateus.pi2.botservice.repositories.MessageRepository;


@ExtendWith(MockitoExtension.class)
class MetricasChatSessionServiceTest {

    @Mock
    private ChatRepository chatRepository;

    @Mock
    private MessageRepository messageRepository;

    @InjectMocks
    private MetricasChatSessionService metricasChatSessionService;

    private static Date toStartOfDay(LocalDate date) {
        return Date.from(date.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }


    private void stubTudoComZeroPorPadrao() {
        lenient().when(chatRepository.countByCreateDateBetween(any(Date.class), any(Date.class)))
                .thenReturn(0);
        lenient().when(messageRepository.countByIssuerAndCreateDateBetween(any(EMessageIssuer.class), any(Date.class), any(Date.class)))
                .thenReturn(0);
        lenient().when(chatRepository.countByChatStatusEqualsAndCreateDateBetween(any(EChatStatus.class), any(Date.class), any(Date.class)))
                .thenReturn(0);
        lenient().when(chatRepository.countByChatRatingGreaterThanEqualAndCreateDateBetween(anyInt(), any(Date.class), any(Date.class)))
                .thenReturn(0);
        lenient().when(chatRepository.countByChatRatingEqualsAndCreateDateBetween(anyInt(), any(Date.class), any(Date.class)))
                .thenReturn(0);
        lenient().when(chatRepository.getAverageChatRating(any(Date.class), any(Date.class)))
                .thenReturn(0.0);
    }

    @Test
    void filtrarPorData_deveAgregarTodasAsMetricasCorretamente() {
        LocalDate inicio = LocalDate.of(2026, 1, 1);
        LocalDate fim = LocalDate.of(2026, 1, 31);
        Date esperadoInicio = toStartOfDay(inicio);
        Date esperadoFim = toStartOfDay(fim.plusDays(1));

        when(chatRepository.countByCreateDateBetween(eq(esperadoInicio), eq(esperadoFim))).thenReturn(100);

        when(messageRepository.countByIssuerAndCreateDateBetween(eq(EMessageIssuer.USER), eq(esperadoInicio), eq(esperadoFim)))
                .thenReturn(40);
        when(messageRepository.countByIssuerAndCreateDateBetween(eq(EMessageIssuer.AGENT), eq(esperadoInicio), eq(esperadoFim)))
                .thenReturn(30);
        when(messageRepository.countByIssuerAndCreateDateBetween(eq(EMessageIssuer.ADMIN), eq(esperadoInicio), eq(esperadoFim)))
                .thenReturn(10);

        when(chatRepository.countByChatStatusEqualsAndCreateDateBetween(eq(EChatStatus.RESOLVIDO), eq(esperadoInicio), eq(esperadoFim)))
                .thenReturn(60);
        when(chatRepository.countByChatStatusEqualsAndCreateDateBetween(eq(EChatStatus.INTERVIDO), eq(esperadoInicio), eq(esperadoFim)))
                .thenReturn(5);
        when(chatRepository.countByChatStatusEqualsAndCreateDateBetween(eq(EChatStatus.AVISADO), eq(esperadoInicio), eq(esperadoFim)))
                .thenReturn(3);
        when(chatRepository.countByChatStatusEqualsAndCreateDateBetween(eq(EChatStatus.PENDENTE), eq(esperadoInicio), eq(esperadoFim)))
                .thenReturn(2);

        when(chatRepository.countByChatRatingGreaterThanEqualAndCreateDateBetween(eq(3), eq(esperadoInicio), eq(esperadoFim)))
                .thenReturn(50);

        when(chatRepository.countByChatRatingEqualsAndCreateDateBetween(eq(1), eq(esperadoInicio), eq(esperadoFim))).thenReturn(1);
        when(chatRepository.countByChatRatingEqualsAndCreateDateBetween(eq(2), eq(esperadoInicio), eq(esperadoFim))).thenReturn(2);
        when(chatRepository.countByChatRatingEqualsAndCreateDateBetween(eq(3), eq(esperadoInicio), eq(esperadoFim))).thenReturn(3);
        when(chatRepository.countByChatRatingEqualsAndCreateDateBetween(eq(4), eq(esperadoInicio), eq(esperadoFim))).thenReturn(4);
        when(chatRepository.countByChatRatingEqualsAndCreateDateBetween(eq(5), eq(esperadoInicio), eq(esperadoFim))).thenReturn(5);

        when(chatRepository.getAverageChatRating(eq(esperadoInicio), eq(esperadoFim))).thenReturn(4.2);

        MetricasChatSession metricas = metricasChatSessionService.filtrarPorData(inicio, fim);

        assertThat(metricas.getTotalAtendimentos()).isEqualTo(100);
        assertThat(metricas.getTotalMensagensRecebidas()).isEqualTo(40);
        assertThat(metricas.getTotalMensagensEnviadas()).isEqualTo(40); 
        assertThat(metricas.getTotalConcluidos()).isEqualTo(60);
        assertThat(metricas.getTotalIntervidos()).isEqualTo(5);
        assertThat(metricas.getTotalAvisados()).isEqualTo(3);
        
        assertThat(metricas.getTotalPendentes()).isEqualTo(2 + 3 + 5);
        assertThat(metricas.getMediaAvaliacao()).isEqualTo(4.2);
        assertThat(metricas.getPorcentagemSucesso()).isEqualTo((50.0 / 60.0) * 100);
        assertThat(metricas.getTotalChatsNota1()).isEqualTo(1);
        assertThat(metricas.getTotalChatsNota2()).isEqualTo(2);
        assertThat(metricas.getTotalChatsNota3()).isEqualTo(3);
        assertThat(metricas.getTotalChatsNota4()).isEqualTo(4);
        assertThat(metricas.getTotalChatsNota5()).isEqualTo(5);
    }

    @Test
    void filtrarPorData_devePorcentagemSucessoZero_quandoNaoHouverAtendimentosConcluidos() {
        LocalDate inicio = LocalDate.of(2026, 2, 1);
        LocalDate fim = LocalDate.of(2026, 2, 28);

        stubTudoComZeroPorPadrao();

        MetricasChatSession metricas = metricasChatSessionService.filtrarPorData(inicio, fim);

        assertThat(metricas.getPorcentagemSucesso()).isEqualTo(0.0);
        assertThat(metricas.getTotalAtendimentos()).isEqualTo(0);
        assertThat(metricas.getTotalConcluidos()).isEqualTo(0);
    }

    @Test
    public void deveRetornarZeradoSeDataNaoExistir() {
        LocalDate dataFim = LocalDate.now();
        LocalDate dataIni = dataFim.minusDays(7);

        stubTudoComZeroPorPadrao();

        MetricasChatSession resultado = metricasChatSessionService.filtrarPorData(dataIni, dataFim);

        assertEquals(Integer.valueOf(0), resultado.getTotalAtendimentos());
        assertEquals(Integer.valueOf(0), resultado.getTotalMensagensRecebidas());
        assertEquals(Integer.valueOf(0), resultado.getTotalMensagensEnviadas());
    }

    @Test
    public void deveRetornarDadosQuandoExistiremRegistros() {
        LocalDate dataFim = LocalDate.now();
        LocalDate dataIni = dataFim.minusDays(7);

        stubTudoComZeroPorPadrao();

        when(chatRepository.countByCreateDateBetween(any(Date.class), any(Date.class)))
            .thenReturn(5);
        when(messageRepository.countByIssuerAndCreateDateBetween(
                eq(EMessageIssuer.USER), any(Date.class), any(Date.class)))
            .thenReturn(10);
        when(messageRepository.countByIssuerAndCreateDateBetween(
                eq(EMessageIssuer.AGENT), any(Date.class), any(Date.class)))
            .thenReturn(8);

        MetricasChatSession resultado = metricasChatSessionService.filtrarPorData(dataIni, dataFim);

        assertEquals(5, resultado.getTotalAtendimentos());
        assertEquals(10, resultado.getTotalMensagensRecebidas());
        assertEquals(8, resultado.getTotalMensagensEnviadas()); // 8 (AGENT) + 0 (ADMIN, do baseline)
    }

    @Test
    public void devePermitirPeriodoDe30Dias() {
        LocalDate dataFim = LocalDate.now();
        LocalDate dataIni = dataFim.minusDays(30);

        stubTudoComZeroPorPadrao();

        assertDoesNotThrow(() -> {
            metricasChatSessionService.filtrarPorData(dataIni, dataFim);
        });
    }
}