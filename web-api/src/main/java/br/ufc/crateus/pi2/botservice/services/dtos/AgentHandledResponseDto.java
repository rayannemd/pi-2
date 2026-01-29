package br.ufc.crateus.pi2.botservice.services.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AgentHandledResponseDto 
{
    private String type;
    private AgentResponseDto chatResponse;
    private Object payload;

    public static AgentHandledResponseDto chat(AgentResponseDto response) 
    {
        var r = new AgentHandledResponseDto();
            r.type = "chat";
            r.chatResponse = response;

        return r;
    }

    public static AgentHandledResponseDto payload(String type, Object payload) 
    {
        var r = new AgentHandledResponseDto();
            r.type = type;
            r.payload = payload;
            
        return r;
    }
}
