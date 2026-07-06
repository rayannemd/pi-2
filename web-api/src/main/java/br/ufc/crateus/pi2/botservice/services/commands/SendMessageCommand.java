package br.ufc.crateus.pi2.botservice.services.commands;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SendMessageCommand 
{
    private String message;

    private String summary;
}