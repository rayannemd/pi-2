package br.ufc.crateus.pi2.botservice.services;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.ufc.crateus.pi2.botservice.configs.EfiBankProperties;
import br.ufc.crateus.pi2.botservice.controllers.dtos.ChatMessageDTO;
import br.ufc.crateus.pi2.botservice.controllers.exceptions.ChargeNotFoundException;
import br.ufc.crateus.pi2.botservice.controllers.exceptions.ChatNotFoundException;
import br.ufc.crateus.pi2.botservice.models.Charge;
import br.ufc.crateus.pi2.botservice.models.Chat;
import br.ufc.crateus.pi2.botservice.models.User;
import br.ufc.crateus.pi2.botservice.models.enums.EChargeStatus;
import br.ufc.crateus.pi2.botservice.models.enums.EMessageIssuer;
import br.ufc.crateus.pi2.botservice.repositories.ChargeRepository;
import br.ufc.crateus.pi2.botservice.repositories.ChatRepository;
import br.ufc.crateus.pi2.botservice.services.dtos.ChargeDto;
import br.ufc.crateus.pi2.botservice.services.external.efibank.EfiBankClient;
import br.ufc.crateus.pi2.botservice.services.external.efibank.dtos.EfiAmount;
import br.ufc.crateus.pi2.botservice.services.external.efibank.dtos.EfiCalendar;
import br.ufc.crateus.pi2.botservice.services.external.efibank.dtos.EfiCobRequest;
import br.ufc.crateus.pi2.botservice.services.external.efibank.dtos.EfiCobResponse;
import br.ufc.crateus.pi2.botservice.services.external.efibank.dtos.EfiDebtor;

@Service
public class ChargeService
{
    private static final int CPF_LENGTH = 11;
    private static final int CNPJ_LENGTH = 14;

    private final ChargeRepository chargeRepository;
    private final ChatRepository chatRepository;
    private final MessageService messageService;
    private final EfiBankClient efiBankClient;
    private final EfiBankProperties properties;
    private final SimpMessagingTemplate messagingTemplate;

    public ChargeService(
        ChargeRepository chargeRepository,
        ChatRepository chatRepository,
        MessageService messageService,
        EfiBankClient efiBankClient,
        EfiBankProperties properties,
        SimpMessagingTemplate messagingTemplate)
    {
        this.chargeRepository = chargeRepository;
        this.chatRepository = chatRepository;
        this.messageService = messageService;
        this.efiBankClient = efiBankClient;
        this.properties = properties;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public ChargeDto createForChat(Long chatId)
    {
        Chat chat = chatRepository.findById(chatId)
            .orElseThrow(ChatNotFoundException::new);

        User user = chat.getUser();
        BigDecimal amount = properties.getMockedAmount();

        EfiCobRequest request = buildCobRequest(user, amount);
        EfiCobResponse efiResponse = efiBankClient.createCob(request);

        Charge charge = new Charge();
        charge.setTxid(efiResponse.getTxid());
        charge.setAmount(amount);
        charge.setStatus(EChargeStatus.PENDING);
        charge.setCopyPaste(efiResponse.getPixCopiaECola());
        charge.setExpirationSeconds(properties.getDefaultExpirationSeconds());
        charge.setUser(user);
        charge.setChat(chat);
        chargeRepository.save(charge);

        return ChargeDto.from(charge);
    }

    @Transactional
    public Optional<ChargeDto> markAsPaid(String txid)
    {
        Charge charge = chargeRepository.findByTxid(txid)
            .orElseThrow(ChargeNotFoundException::new);

        if (charge.getStatus() == EChargeStatus.PAID)
            return Optional.of(ChargeDto.from(charge));

        EfiCobResponse remote = efiBankClient.getCob(txid);
        if (remote == null || !remote.isConcluded())
            return Optional.empty();

        charge.setStatus(EChargeStatus.PAID);
        charge.setPaidAt(Instant.now());
        chargeRepository.save(charge);

        publishPaymentConfirmation(charge);

        return Optional.of(ChargeDto.from(charge));
    }

    private EfiCobRequest buildCobRequest(User user, BigDecimal amount)
    {
        EfiCobRequest request = new EfiCobRequest();
        request.setCalendario(new EfiCalendar(properties.getDefaultExpirationSeconds()));
        request.setValor(new EfiAmount(amount.toPlainString()));
        request.setChave(properties.getPixKey());
        request.setDebtor(buildDebtor(user));
        request.setSolicitacaoPagador("Pagamento solicitado via chat.");
        return request;
    }

    private EfiDebtor buildDebtor(User user)
    {
        if (user == null || user.getCpfCnpj() == null || user.getCpfCnpj().isBlank())
            return null;

        String digits = user.getCpfCnpj().replaceAll("\\D", "");
        String name = user.getName();

        if (digits.length() == CPF_LENGTH)
            return EfiDebtor.ofCpf(name, digits);
        if (digits.length() == CNPJ_LENGTH)
            return EfiDebtor.ofCnpj(name, digits);

        return null;
    }

    private void publishPaymentConfirmation(Charge charge)
    {
        String content = String.format(
            "Pagamento de R$ %s confirmado. Obrigado!",
            charge.getAmount().toPlainString());

        messageService.save(new ChatMessageDTO(content, EMessageIssuer.AGENT, charge.getChat()));

        messagingTemplate.convertAndSend(
            "/topic/chats/" + charge.getChat().getId(),
            new ChatMessageDTO(content, EMessageIssuer.AGENT, charge.getChat()));
    }
}
