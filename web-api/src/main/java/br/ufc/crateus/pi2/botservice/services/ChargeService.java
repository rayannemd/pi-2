package br.ufc.crateus.pi2.botservice.services;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
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
import br.ufc.crateus.pi2.botservice.models.Installment;
import br.ufc.crateus.pi2.botservice.models.User;
import br.ufc.crateus.pi2.botservice.models.enums.EChargeStatus;
import br.ufc.crateus.pi2.botservice.models.enums.EInstallmentStatus;
import br.ufc.crateus.pi2.botservice.models.enums.EMessageIssuer;
import br.ufc.crateus.pi2.botservice.repositories.ChargeRepository;
import br.ufc.crateus.pi2.botservice.repositories.ChatRepository;
import br.ufc.crateus.pi2.botservice.repositories.InstallmentRepository;
import br.ufc.crateus.pi2.botservice.services.dtos.ChargeDto;
import br.ufc.crateus.pi2.botservice.services.dtos.InstallmentDto;
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
    private static final DateTimeFormatter REFERENCE_MONTH = DateTimeFormatter.ofPattern("MM/yyyy");

    private final ChargeRepository chargeRepository;
    private final ChatRepository chatRepository;
    private final InstallmentRepository installmentRepository;
    private final MessageService messageService;
    private final EfiBankClient efiBankClient;
    private final EfiBankProperties properties;
    private final SimpMessagingTemplate messagingTemplate;

    public ChargeService(
        ChargeRepository chargeRepository,
        ChatRepository chatRepository,
        InstallmentRepository installmentRepository,
        MessageService messageService,
        EfiBankClient efiBankClient,
        EfiBankProperties properties,
        SimpMessagingTemplate messagingTemplate)
    {
        this.chargeRepository = chargeRepository;
        this.chatRepository = chatRepository;
        this.installmentRepository = installmentRepository;
        this.messageService = messageService;
        this.efiBankClient = efiBankClient;
        this.properties = properties;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional(readOnly = true)
    public List<InstallmentDto> getOpenInstallments(Long chatId)
    {
        Chat chat = chatRepository.findById(chatId)
            .orElseThrow(ChatNotFoundException::new);

        return installmentRepository
            .findByUserIdAndStatusOrderByReferenceMonth(chat.getUser().getId(), EInstallmentStatus.OPEN)
            .stream()
            .sorted(Comparator.comparing(i -> YearMonth.parse(i.getReferenceMonth(), REFERENCE_MONTH)))
            .map(InstallmentDto::from)
            .toList();
    }

    @Transactional
    public ChargeDto createForInstallments(Long chatId, List<Long> installmentIds)
    {
        Chat chat = chatRepository.findById(chatId)
            .orElseThrow(ChatNotFoundException::new);

        User user = chat.getUser();
        List<Installment> selected = loadOpenInstallments(user, installmentIds);

        BigDecimal amount = selected.stream()
            .map(Installment::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

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

        for (Installment installment : selected)
            installment.setCharge(charge);
        installmentRepository.saveAll(selected);

        List<InstallmentDto> items = selected.stream().map(InstallmentDto::from).toList();
        return ChargeDto.from(charge, items);
    }

    private List<Installment> loadOpenInstallments(User user, List<Long> installmentIds)
    {
        if (installmentIds == null || installmentIds.isEmpty())
            throw new IllegalArgumentException("Nenhuma mensalidade selecionada.");

        List<Installment> found = installmentRepository.findAllById(installmentIds);

        if (found.size() != installmentIds.stream().distinct().count())
            throw new IllegalArgumentException("Mensalidade inexistente na seleção.");

        for (Installment installment : found)
        {
            if (!installment.getUser().getId().equals(user.getId()))
                throw new IllegalArgumentException("Mensalidade não pertence ao usuário.");
            if (installment.getStatus() != EInstallmentStatus.OPEN)
                throw new IllegalArgumentException("Mensalidade já paga: " + installment.getReferenceMonth());
        }

        return found;
    }

    @Transactional
    public Optional<ChargeDto> markAsPaid(String txid)
    {
        Charge charge = chargeRepository.findByTxid(txid)
            .orElseThrow(ChargeNotFoundException::new);

        if (charge.getStatus() == EChargeStatus.PAID)
            return Optional.of(ChargeDto.from(charge));

        if (!refreshFromEfi(charge))
            return Optional.empty();

        persistPaymentConfirmation(charge);

        return Optional.of(ChargeDto.from(charge));
    }

    @Transactional
    public Optional<ChargeDto> getLatestChargeStatus(Long chatId)
    {
        Optional<Charge> latest = chargeRepository.findFirstByChat_IdOrderByCreateDateDesc(chatId);
        if (latest.isEmpty())
            return Optional.empty();

        Charge charge = latest.get();
        if (charge.getStatus() == EChargeStatus.PENDING)
        {
            refreshFromEfi(charge);
        }

        return Optional.of(ChargeDto.from(charge));
    }

    private boolean refreshFromEfi(Charge charge)
    {
        EfiCobResponse remote = efiBankClient.getCob(charge.getTxid());
        if (remote == null || !remote.isConcluded())
            return false;

        charge.setStatus(EChargeStatus.PAID);
        charge.setPaidAt(Instant.now());
        chargeRepository.save(charge);

        settleInstallments(charge);
        broadcastPaymentConfirmation(charge);

        return true;
    }

    private void settleInstallments(Charge charge)
    {
        List<Installment> installments = installmentRepository.findByChargeId(charge.getId());
        if (installments.isEmpty())
            return;

        List<Installment> toSettle = new ArrayList<>();
        for (Installment installment : installments)
        {
            if (installment.getStatus() == EInstallmentStatus.PAID)
                continue;
            installment.setStatus(EInstallmentStatus.PAID);
            installment.setPaidAt(charge.getPaidAt());
            toSettle.add(installment);
        }
        installmentRepository.saveAll(toSettle);
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

        if (digits.length() == CPF_LENGTH && isValidCpf(digits))
            return EfiDebtor.ofCpf(name, digits);
        if (digits.length() == CNPJ_LENGTH && isValidCnpj(digits))
            return EfiDebtor.ofCnpj(name, digits);

        return null;
    }

    private static boolean isValidCpf(String cpf)
    {
        if (cpf.length() != CPF_LENGTH || cpf.chars().distinct().count() == 1)
            return false;

        int sum = 0;
        for (int i = 0; i < 9; i++)
            sum += (cpf.charAt(i) - '0') * (10 - i);
        int firstCheck = 11 - (sum % 11);
        if (firstCheck >= 10) firstCheck = 0;
        if (firstCheck != cpf.charAt(9) - '0')
            return false;

        sum = 0;
        for (int i = 0; i < 10; i++)
            sum += (cpf.charAt(i) - '0') * (11 - i);
        int secondCheck = 11 - (sum % 11);
        if (secondCheck >= 10) secondCheck = 0;
        return secondCheck == cpf.charAt(10) - '0';
    }

    private static boolean isValidCnpj(String cnpj)
    {
        if (cnpj.length() != CNPJ_LENGTH || cnpj.chars().distinct().count() == 1)
            return false;

        int[] firstWeights = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int[] secondWeights = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};

        int sum = 0;
        for (int i = 0; i < 12; i++)
            sum += (cnpj.charAt(i) - '0') * firstWeights[i];
        int firstCheck = 11 - (sum % 11);
        if (firstCheck >= 10) firstCheck = 0;
        if (firstCheck != cnpj.charAt(12) - '0')
            return false;

        sum = 0;
        for (int i = 0; i < 13; i++)
            sum += (cnpj.charAt(i) - '0') * secondWeights[i];
        int secondCheck = 11 - (sum % 11);
        if (secondCheck >= 10) secondCheck = 0;
        return secondCheck == cnpj.charAt(13) - '0';
    }

    private void persistPaymentConfirmation(Charge charge)
    {
        messageService.save(new ChatMessageDTO(
            paymentConfirmationText(charge), EMessageIssuer.AGENT, charge.getChat()));
    }

    private void broadcastPaymentConfirmation(Charge charge)
    {
        messagingTemplate.convertAndSend(
            "/topic/chats/" + charge.getChat().getId(),
            new ChatMessageDTO(paymentConfirmationText(charge), EMessageIssuer.AGENT, charge.getChat()));
    }

    private String paymentConfirmationText(Charge charge)
    {
        return String.format(
            "Pagamento de R$ %s confirmado. Obrigado!",
            charge.getAmount().toPlainString());
    }
}
