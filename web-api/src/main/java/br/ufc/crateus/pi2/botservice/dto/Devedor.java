package br.ufc.crateus.pi2.botservice.dto;


import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Value;

@Value
@JsonInclude(JsonInclude.Include.NON_NULL) // remove os elementos =null na serialização
public class Devedor {
    String nome;
    String cpf;
    String cnpj;
}
