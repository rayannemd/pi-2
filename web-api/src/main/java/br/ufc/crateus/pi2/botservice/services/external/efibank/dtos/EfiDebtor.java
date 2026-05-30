package br.ufc.crateus.pi2.botservice.services.external.efibank.dtos;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class EfiDebtor
{
    private String nome;
    private String cpf;
    private String cnpj;

    public static EfiDebtor ofCpf(String name, String cpf)
    {
        return new EfiDebtor(name, cpf, null);
    }

    public static EfiDebtor ofCnpj(String name, String cnpj)
    {
        return new EfiDebtor(name, null, cnpj);
    }
}
