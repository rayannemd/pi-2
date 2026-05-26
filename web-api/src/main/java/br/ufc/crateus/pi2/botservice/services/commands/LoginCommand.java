package br.ufc.crateus.pi2.botservice.services.commands;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LoginCommand 
{
    @NotBlank(message = "É necessário informar o email do usuário")
    private String email;

    @NotBlank(message = "É necessário informar a senha do usuário")
    private String password;
}