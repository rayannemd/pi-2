package br.ufc.crateus.pi2.botservice.services.commands;

import br.ufc.crateus.pi2.botservice.models.Address;
import br.ufc.crateus.pi2.botservice.models.User;
import br.ufc.crateus.pi2.botservice.models.enums.EUserType;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

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
    private String cpf_cnpj;

    @NotNull(message = "É necessário informar o tipo do usuário")
    private EUserType userType;

    @NotNull(message = "É necessário informar o endereço do usuário")
    private Address address;    

    public User toUser() 
    {
        User user = new User();
        user.setName(this.name);
        user.setEmail(this.email);
        user.setPassword(this.password);
        user.setCpf_cnpj(this.cpf_cnpj);
        user.setUserType(this.userType);

        Address addr = new Address();
            addr.setStreet(this.address.getStreet());
            addr.setNumber(this.address.getNumber());
            addr.setNeighborhood(this.address.getNeighborhood());
            addr.setCity(this.address.getCity());
            addr.setState(this.address.getState());
            addr.setZipCode(this.address.getZipCode());

            user.setAddress(addr);
            addr.setUser(user);
        
        return user;
    }
}
