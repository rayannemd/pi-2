package br.ufc.crateus.pi2.botservice.services.dtos;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AgentResponseDto 
{
    private String message;

    private Map<String, Object> classification;

    private String summary;

    private String answer;
}
