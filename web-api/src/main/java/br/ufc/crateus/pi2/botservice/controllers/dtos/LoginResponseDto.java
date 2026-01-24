package br.ufc.crateus.pi2.botservice.controllers.dtos;

import br.ufc.crateus.pi2.botservice.models.User;
import br.ufc.crateus.pi2.botservice.models.enums.EUserType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponseDto 
{
    private String email;

    private String name;

    private String token;

    private EUserType userType;

    public static LoginResponseDto fromUser(User user, String token) 
    {
        return new LoginResponseDto(
            user.getEmail(),
            user.getName(),
            token,
            user.getType()
        );
    }
}
