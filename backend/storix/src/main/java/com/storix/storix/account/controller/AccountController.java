package com.storix.storix.account.controller;

import com.storix.storix.account.dto.AccountResponse;
import com.storix.storix.account.entity.ConnectedAccount;
import com.storix.storix.account.service.AccountService;
import com.storix.storix.account.service.GoogleOAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {
    private final AccountService accountService;
    private final GoogleOAuthService googleOAuthService;
    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @GetMapping
    public List<AccountResponse> getConnectedAccount(
            Authentication authentication
    ){
        Long userId = Long.parseLong(authentication.getName());

        return accountService.getConnectedAccounts(userId);
    }

    @GetMapping("/google/connect")
    public ResponseEntity<Map<String, String>> connectGoogle(
            Authentication authentication) {

        Long userId = Long.parseLong(authentication.getName());

        String authorizationUrl =
                googleOAuthService.generateAuthorizationUrl(userId);

        return ResponseEntity.ok(
                Map.of("authorizationUrl", authorizationUrl)
        );
    }

    @GetMapping("/google/callback")
    public ResponseEntity<Void> googleCallback(
            @RequestParam String code,
            @RequestParam String state
    ) {
        googleOAuthService.handleCallback(code, state);

        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(frontendUrl + "/"))
                .build();
    }
    }



