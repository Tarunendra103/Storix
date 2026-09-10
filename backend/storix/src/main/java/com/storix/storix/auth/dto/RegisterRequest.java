package com.storix.storix.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {

    @NotBlank
    private String name;
    @Email
    @NotBlank
    private String email;
    @NotBlank
    @Size(min = 8, max = 16)
    private String password;
}
