package br.ufc.crateus.pi2.botservice.services.commands;

import br.ufc.crateus.pi2.botservice.models.Chat;
import br.ufc.crateus.pi2.botservice.models.enums.EChatType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateChatCommand 
{
    private String title;

    private String summary;

    private EChatType type;

    public Chat toChat() 
    {
        Chat chat = new Chat();
        chat.setTitle(this.title);
        chat.setSummary(this.summary);
        chat.setType(this.type);
        return chat;
    }
}
