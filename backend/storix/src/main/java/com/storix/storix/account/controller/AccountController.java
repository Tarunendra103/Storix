package com.storix.storix.account.controller;

import com.storix.storix.account.dto.AccountResponse;
import com.storix.storix.account.entity.ConnectedAccount;
import com.storix.storix.account.service.AccountService;
import com.storix.storix.account.service.GoogleOAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
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
    public ResponseEntity<Void> connectGoogle(
            Authentication authentication) {

        Long userId = Long.parseLong(authentication.getName());
        String authorizationUrl=googleOAuthService.generateAuthorizationUrl(userId);


        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(authorizationUrl))
                        .build();
    }

    @GetMapping("/google/callback")
    public AccountResponse googleCallback(
            @RequestParam String code,
            @RequestParam String state
    ){
        ConnectedAccount account = googleOAuthService.handleCallback(code,state);
        return new AccountResponse(
                account.getId()
                ,account.getProvider()
                ,account.getAccountEmail()
                ,account.getTotalStorage(),
                account.getUsedStorage()
        );
    }
}


