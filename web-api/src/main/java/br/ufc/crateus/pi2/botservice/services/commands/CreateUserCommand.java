package br.ufc.crateus.pi2.botservice.services.commands;

import br.ufc.crateus.pi2.botservice.models.User;
import br.ufc.crateus.pi2.botservice.models.enums.EUserType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateUserCommand 
{
    @NotBlank(message = "É necessário informar o nome do usuário")
    private String name;

    @NotBlank(message = "É necessário informar o email do usuário")
    private String email;

    @NotBlank(message = "É necessário informar a senha do usuário")
    private String password;

    @NotBlank(message = "É necessário informar o CPF ou CNPJ do usuário")
    private String cpfCnpj;

    @NotNull(message = "É necessário informar o tipo do usuário")
    private EUserType type;

    public User toUser() 
    {
        User user = new User();
        user.setName(this.name);
        user.setEmail(this.email);
        user.setPassword(this.password);
        user.setCpfCnpj(this.cpfCnpj);
        user.setType(this.type);
        
        return user;
    }
}
