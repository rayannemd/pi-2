//Dto usado pelo websocket

package br.ufc.crateus.pi2.botservice.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {

    private Long chatId;
    private Long senderId;
    private String senderName;
    private String content;
}
