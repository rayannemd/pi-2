package br.ufc.crateus.pi2.botservice.services.external;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import br.ufc.crateus.pi2.botservice.controllers.dtos.ChatMessageDTO;
import br.ufc.crateus.pi2.botservice.controllers.exceptions.ChatNotFoundException;
import br.ufc.crateus.pi2.botservice.models.Chat;
import br.ufc.crateus.pi2.botservice.models.enums.EMessageIssuer;
import br.ufc.crateus.pi2.botservice.repositories.ChatRepository;
import br.ufc.crateus.pi2.botservice.services.ChargeService;
import br.ufc.crateus.pi2.botservice.services.MessageService;
import br.ufc.crateus.pi2.botservice.services.commands.SendMessageCommand;
import br.ufc.crateus.pi2.botservice.services.dtos.AgentHandledResponseDto;
import br.ufc.crateus.pi2.botservice.services.dtos.AgentResponseDto;
import br.ufc.crateus.pi2.botservice.services.dtos.ChargeDto;

@Service
public class AgentExternalService
{
    private static final String BASE_URL = "http://agente:5000";

    @Autowired
    private WebClient webClient;

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private MessageService messageService;

    @Autowired
    private ChargeService chargeService;


    //public AgentHandledResponseDto sendMessage(Chat chat, SendMessageCommand command){
    //}

    public AgentHandledResponseDto sendMessage(Long chatId, SendMessageCommand command)
    {
        var chat = chatRepository.findById(chatId)
            .orElseThrow(() -> new ChatNotFoundException());

        if(chat.getSummary() != null)
            command.setSummary(chat.getSummary());
        
        command.setTimedOut(false);

        messageService.save(new ChatMessageDTO(command.getMessage(), EMessageIssuer.USER, chat));

        var response = webClient.post()
                        .uri(BASE_URL + "/prompt-agent")
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(command)
                        .retrieve()
                        .bodyToMono(AgentResponseDto.class)
                        .block();

        if(chat.getTitle() == null || chat.getTitle().isBlank())
            chat.setTitle(response.getSummary());

        var handledResponse = handleResponseType(chat, response);

        chatRepository.save(chat);
        return handledResponse;
    }

    private AgentHandledResponseDto handleResponseType(Chat chat, AgentResponseDto response)
    {
        var type = normalizeType(String.valueOf(response.getClassification().get("type")));

        switch (type)
        {
            case "chat" -> {
                chat.setSummary(response.getSummary());
                messageService.save(new ChatMessageDTO(response.getAnswer(), EMessageIssuer.AGENT, chat));
                return AgentHandledResponseDto.chat(response);
            }

            case "consulta_plano" -> {
                var user = chat.getUser();
                var services = user.getServices();
                return AgentHandledResponseDto.payload(type, services);
            }

            case "pagamento_plano" -> {
                var openInstallments = chargeService.getOpenInstallments(chat.getId());

                if (openInstallments.isEmpty()) {
                    messageService.save(new ChatMessageDTO(
                            "Você não possui mensalidades em aberto no momento.",
                            EMessageIssuer.AGENT, chat));
                    return AgentHandledResponseDto.payload(type, openInstallments);
                }

                messageService.save(new ChatMessageDTO(
                        "Estas são suas mensalidades em aberto. Selecione quais deseja pagar.",
                        EMessageIssuer.AGENT, chat));
                return AgentHandledResponseDto.payload(type, openInstallments);
            }

            case "status_pagamento" -> {
                var status = chargeService.getLatestChargeStatus(chat.getId());

                if (status.isEmpty()) {
                    messageService.save(new ChatMessageDTO(
                            "Você ainda não possui cobranças geradas neste chat.",
                            EMessageIssuer.AGENT, chat));
                    return AgentHandledResponseDto.payload(type, null);
                }

                ChargeDto charge = status.get();
                messageService.save(new ChatMessageDTO(
                        buildStatusMessage(charge), EMessageIssuer.AGENT, chat));
                return AgentHandledResponseDto.payload(type, charge);
            }

            default -> {
                return null;
            }
        }
    }

    private String buildStatusMessage(ChargeDto charge)
    {
        String amount = charge.getAmount() != null ? charge.getAmount().toPlainString() : "-";

        return switch (charge.getStatus())
        {
            case PAID -> "Sua cobrança de R$ " + amount + " já foi paga. Obrigado!";
            case EXPIRED -> "Sua cobrança de R$ " + amount + " expirou. Gere uma nova para pagar.";
            case FAILED -> "Sua cobrança de R$ " + amount + " falhou. Tente gerar novamente.";
            default -> "Sua cobrança de R$ " + amount + " ainda está pendente de pagamento.";
        };
    }

    private String normalizeType(String raw)
    {
        String value = raw == null ? "" : raw.trim().toLowerCase();

        return switch (value)
        {
            case "chat", "consulta_plano", "pagamento_plano", "status_pagamento" -> value;
            default -> "chat";
        };
    }
}
