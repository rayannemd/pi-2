package br.ufc.crateus.pi2.botservice.controllers.dtos;

import br.ufc.crateus.pi2.botservice.models.Chat;
import br.ufc.crateus.pi2.botservice.models.enums.EMessageIssuer;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO 
{
    private String content;

    private EMessageIssuer issuer;
    
    private Chat chat;
}
