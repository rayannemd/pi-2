package br.ufc.crateus.pi2.botservice.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import br.ufc.crateus.pi2.botservice.configs.EfiBankProperties;
import br.ufc.crateus.pi2.botservice.controllers.exceptions.ChargeNotFoundException;
import br.ufc.crateus.pi2.botservice.controllers.exceptions.ChatNotFoundException;
import br.ufc.crateus.pi2.botservice.models.Charge;
import br.ufc.crateus.pi2.botservice.models.Chat;
import br.ufc.crateus.pi2.botservice.models.Installment;
import br.ufc.crateus.pi2.botservice.models.Service;
import br.ufc.crateus.pi2.botservice.models.User;
import br.ufc.crateus.pi2.botservice.models.enums.EChargeStatus;
import br.ufc.crateus.pi2.botservice.models.enums.EInstallmentStatus;
import br.ufc.crateus.pi2.botservice.repositories.ChargeRepository;
import br.ufc.crateus.pi2.botservice.repositories.ChatRepository;
import br.ufc.crateus.pi2.botservice.repositories.InstallmentRepository;
import br.ufc.crateus.pi2.botservice.services.dtos.ChargeDto;
import br.ufc.crateus.pi2.botservice.services.external.efibank.EfiBankClient;
import br.ufc.crateus.pi2.botservice.services.external.efibank.dtos.EfiCobResponse;

/**
 * Testes unitários para ChargeService.
 *
 * Todas as dependências externas (repositórios, cliente da Efí Bank, WebSocket)
 * são mockadas — nenhuma chamada real de rede ou banco é feita.
 */
@ExtendWith(MockitoExtension.class)
class ChargeServiceTest {

    // CPF válido apenas para teste (dígitos verificadores corretos, sem pertencer a ninguém)
    private static final String VALID_CPF = "11144477735";

    @Mock
    private ChargeRepository chargeRepository;

    @Mock
    private ChatRepository chatRepository;

    @Mock
    private InstallmentRepository installmentRepository;

    @Mock
    private MessageService messageService;

    @Mock
    private EfiBankClient efiBankClient;

    @Mock
    private EfiBankProperties properties;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    private ChargeService chargeService;

    private User user;
    private Chat chat;

    @BeforeEach
    void setUp() {
        chargeService = new ChargeService(
                chargeRepository, chatRepository, installmentRepository,
                messageService, efiBankClient, properties, messagingTemplate);

        user = new User();
        user.setId(10L);
        user.setName("Carlos Souza");
        user.setCpfCnpj(VALID_CPF);

        chat = new Chat();
        chat.setId(5L);
        chat.setUser(user);
    }

    private Installment installment(Long id, String month, String amount, EInstallmentStatus status, User owner) {
        Installment installment = new Installment();
        installment.setId(id);
        installment.setUser(owner);
        Service service = new Service();
        service.setName("Plano Mensal");
        installment.setService(service);
        installment.setReferenceMonth(month);
        installment.setAmount(new BigDecimal(amount));
        installment.setStatus(status);
        return installment;
    }

    

    @Test
    void getOpenInstallments_deveLancarExcecao_quandoChatNaoExistir() {
        when(chatRepository.findById(5L)).thenReturn(Optional.empty());

        assertThrows(ChatNotFoundException.class, () -> chargeService.getOpenInstallments(5L));
    }

    @Test
    void getOpenInstallments_deveRetornarOrdenadoPorMesReferencia() {
        Installment marco = installment(1L, "03/2026", "100.00", EInstallmentStatus.OPEN, user);
        Installment janeiro = installment(2L, "01/2026", "100.00", EInstallmentStatus.OPEN, user);

        when(chatRepository.findById(5L)).thenReturn(Optional.of(chat));
        when(installmentRepository.findByUserIdAndStatusOrderByReferenceMonth(10L, EInstallmentStatus.OPEN))
                .thenReturn(List.of(marco, janeiro));

        var result = chargeService.getOpenInstallments(5L);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getReferenceMonth()).isEqualTo("01/2026");
        assertThat(result.get(1).getReferenceMonth()).isEqualTo("03/2026");
    }

   

    @Test
    void createForInstallments_deveLancarExcecao_quandoListaVazia() {
        when(chatRepository.findById(5L)).thenReturn(Optional.of(chat));

        assertThrows(IllegalArgumentException.class,
                () -> chargeService.createForInstallments(5L, List.of()));

        verify(efiBankClient, never()).createCob(any());
    }

    @Test
    void createForInstallments_deveLancarExcecao_quandoMensalidadeNaoExistir() {
        when(chatRepository.findById(5L)).thenReturn(Optional.of(chat));
        // Pediu 2 ids, mas o repositório só encontrou 1
        when(installmentRepository.findAllById(List.of(1L, 2L)))
                .thenReturn(List.of(installment(1L, "01/2026", "100.00", EInstallmentStatus.OPEN, user)));

        assertThrows(IllegalArgumentException.class,
                () -> chargeService.createForInstallments(5L, List.of(1L, 2L)));
    }

    @Test
    void createForInstallments_deveLancarExcecao_quandoMensalidadeNaoPertenceAoUsuario() {
        User outroUsuario = new User();
        outroUsuario.setId(999L);

        when(chatRepository.findById(5L)).thenReturn(Optional.of(chat));
        when(installmentRepository.findAllById(List.of(1L)))
                .thenReturn(List.of(installment(1L, "01/2026", "100.00", EInstallmentStatus.OPEN, outroUsuario)));

        assertThrows(IllegalArgumentException.class,
                () -> chargeService.createForInstallments(5L, List.of(1L)));
    }

    @Test
    void createForInstallments_deveLancarExcecao_quandoMensalidadeJaPaga() {
        when(chatRepository.findById(5L)).thenReturn(Optional.of(chat));
        when(installmentRepository.findAllById(List.of(1L)))
                .thenReturn(List.of(installment(1L, "01/2026", "100.00", EInstallmentStatus.PAID, user)));

        assertThrows(IllegalArgumentException.class,
                () -> chargeService.createForInstallments(5L, List.of(1L)));
    }

    @Test
    void createForInstallments_deveCriarCobrancaComSomaDosValores_quandoTudoValido() {
        Installment i1 = installment(1L, "01/2026", "100.00", EInstallmentStatus.OPEN, user);
        Installment i2 = installment(2L, "02/2026", "50.00", EInstallmentStatus.OPEN, user);

        EfiCobResponse efiResponse = new EfiCobResponse();
        efiResponse.setTxid("tx-123");
        efiResponse.setPixCopiaECola("00020126copia-e-cola");

        when(chatRepository.findById(5L)).thenReturn(Optional.of(chat));
        when(installmentRepository.findAllById(List.of(1L, 2L))).thenReturn(List.of(i1, i2));
        when(properties.getDefaultExpirationSeconds()).thenReturn(3600);
        when(efiBankClient.createCob(any())).thenReturn(efiResponse);

        ChargeDto result = chargeService.createForInstallments(5L, List.of(1L, 2L));

        assertThat(result.getTxid()).isEqualTo("tx-123");
        assertThat(result.getAmount()).isEqualByComparingTo("150.00");
        assertThat(result.getCopyPaste()).isEqualTo("00020126copia-e-cola");
        assertThat(result.getItems()).hasSize(2);

        ArgumentCaptor<Charge> chargeCaptor = ArgumentCaptor.forClass(Charge.class);
        verify(chargeRepository, times(1)).save(chargeCaptor.capture());
        assertThat(chargeCaptor.getValue().getStatus()).isEqualTo(EChargeStatus.PENDING);
        assertThat(chargeCaptor.getValue().getUser()).isEqualTo(user);

        verify(installmentRepository, times(1)).saveAll(anyList());
    }


    @Test
    void markAsPaid_deveLancarExcecao_quandoCobrancaNaoExistir() {
        when(chargeRepository.findByTxid("tx-404")).thenReturn(Optional.empty());

        assertThrows(ChargeNotFoundException.class, () -> chargeService.markAsPaid("tx-404"));
    }

    @Test
    void markAsPaid_deveRetornarSemChamarEfi_quandoJaEstiverPaga() {
        Charge charge = new Charge();
        charge.setTxid("tx-paid");
        charge.setAmount(new BigDecimal("100.00"));
        charge.setStatus(EChargeStatus.PAID);

        when(chargeRepository.findByTxid("tx-paid")).thenReturn(Optional.of(charge));

        Optional<ChargeDto> result = chargeService.markAsPaid("tx-paid");

        assertThat(result).isPresent();
        assertThat(result.get().getStatus()).isEqualTo(EChargeStatus.PAID);
        verify(efiBankClient, never()).getCob(anyString());
    }

    @Test
    void markAsPaid_deveRetornarVazio_quandoEfiAindaNaoConcluiu() {
        Charge charge = new Charge();
        charge.setTxid("tx-pending");
        charge.setAmount(new BigDecimal("100.00"));
        charge.setStatus(EChargeStatus.PENDING);

        EfiCobResponse remote = new EfiCobResponse();
        remote.setStatus("ATIVA");

        when(chargeRepository.findByTxid("tx-pending")).thenReturn(Optional.of(charge));
        when(efiBankClient.getCob("tx-pending")).thenReturn(remote);

        Optional<ChargeDto> result = chargeService.markAsPaid("tx-pending");

        assertThat(result).isEmpty();
        verify(chargeRepository, never()).save(any(Charge.class));
        verify(messageService, never()).save(any());
    }

    @Test
    void markAsPaid_deveQuitarMensalidadesENotificar_quandoEfiConcluiu() {
        Charge charge = new Charge();
        charge.setId(50L);
        charge.setTxid("tx-ok");
        charge.setAmount(new BigDecimal("150.00"));
        charge.setStatus(EChargeStatus.PENDING);
        charge.setChat(chat);

        Installment aberta = installment(1L, "01/2026", "100.00", EInstallmentStatus.OPEN, user);
        Installment jaPaga = installment(2L, "02/2026", "50.00", EInstallmentStatus.PAID, user);

        EfiCobResponse remote = new EfiCobResponse();
        remote.setStatus("CONCLUIDA");

        when(chargeRepository.findByTxid("tx-ok")).thenReturn(Optional.of(charge));
        when(efiBankClient.getCob("tx-ok")).thenReturn(remote);
        when(installmentRepository.findByChargeId(50L)).thenReturn(List.of(aberta, jaPaga));

        Optional<ChargeDto> result = chargeService.markAsPaid("tx-ok");

        assertThat(result).isPresent();
        assertThat(result.get().getStatus()).isEqualTo(EChargeStatus.PAID);

        // Apenas a mensalidade em aberto deve ser quitada e enviada ao saveAll
        ArgumentCaptor<List<Installment>> captor = ArgumentCaptor.forClass(List.class);
        verify(installmentRepository, times(1)).saveAll(captor.capture());
        assertThat(captor.getValue()).hasSize(1);
        assertThat(captor.getValue().get(0).getId()).isEqualTo(1L);
        assertThat(aberta.getStatus()).isEqualTo(EInstallmentStatus.PAID);

        verify(chargeRepository, times(1)).save(charge);
        verify(messageService, times(1)).save(any());
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/chats/5"), any(Object.class));
    }


    @Test
    void getLatestChargeStatus_deveRetornarDto_quandoExistirCobranca() {
        Charge charge = new Charge();
        charge.setTxid("tx-latest");
        charge.setAmount(new BigDecimal("20.00"));
        charge.setStatus(EChargeStatus.PENDING);

        when(chargeRepository.findFirstByChat_IdOrderByCreateDateDesc(5L)).thenReturn(Optional.of(charge));

        Optional<ChargeDto> result = chargeService.getLatestChargeStatus(5L);

        assertThat(result).isPresent();
        assertThat(result.get().getTxid()).isEqualTo("tx-latest");
    }

    @Test
    void getLatestChargeStatus_deveRetornarVazio_quandoNaoExistirCobranca() {
        when(chargeRepository.findFirstByChat_IdOrderByCreateDateDesc(5L)).thenReturn(Optional.empty());

        Optional<ChargeDto> result = chargeService.getLatestChargeStatus(5L);

        assertThat(result).isEmpty();
    }
}