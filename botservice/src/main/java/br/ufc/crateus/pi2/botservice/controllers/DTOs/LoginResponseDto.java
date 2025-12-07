package br.ufc.crateus.pi2.botservice.controllers.DTOs;

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

    public static LoginResponseDto toLoginResponseDto(User user) 
    {
        return new LoginResponseDto(
            user.getEmail(),
            user.getName(),
            null,
            user.getUserType()
        );
    }
}
