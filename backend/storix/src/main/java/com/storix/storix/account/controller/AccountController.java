package com.storix.storix.account.controller;

import com.storix.storix.account.dto.AccountResponse;
import com.storix.storix.account.entity.ConnectedAccount;
import com.storix.storix.account.service.AccountService;
import com.storix.storix.account.service.GoogleOAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {
    private final AccountService accountService;
    private final GoogleOAuthService googleOAuthService;

    @GetMapping
    public List<AccountResponse> getConnectedAccount(
            Authentication authentication
    ){
        Long userId = Long.parseLong(authentication.getName());

        return accountService.getConnectedAccounts(userId);
    }

    @GetMapping("/google/connect")
    public String connectGoogle(Authentication authentication) {

        Long userId = Long.parseLong(authentication.getName());

        return googleOAuthService.generateAuthorizationUrl(userId);
    }
}

}
