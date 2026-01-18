package br.ufc.crateus.pi2.botservice.services.commands;

import br.ufc.crateus.pi2.botservice.models.Service;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateServiceCommand 
{
    @NotNull(message = "É necessário informar o nome do serviço")
    private String name;

    @NotNull(message = "É necessário informar a descrição do serviço")
    private String description;

    public Service toService() 
    {
        Service service = new Service();
        service.setName(this.name);
        service.setDescription(this.description);
        return service;
    }
}
