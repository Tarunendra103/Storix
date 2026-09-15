package com.storix.storix.account.service;

import com.storix.storix.account.entity.ConnectedAccount;
import com.storix.storix.account.repository.ConnectedAccountRepository;
import com.storix.storix.common.Enums.StorageProvider;
import com.storix.storix.user.entity.User;
import com.storix.storix.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleOAuthService {
    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;
    private final UserRepository userRepository;
    private final ConnectedAccountRepository connectedAccountRepository;

    private final RestClient restClient = RestClient.create();

    @Value("${google.oauth.client-id}")
    private String clientId;

    @Value("${google.oauth.client-secret}")
    private String clientSecret;

    @Value("${google.oauth.redirect-uri}")
    private String redirectUri;

    @Value("${google.oauth.authorization-uri}")
    private String authorizationUri;

    @Value("${google.oauth.token-uri}")
    private String tokenUri;

    public String generateAuthorizationUrl(Long userId) {

        String state = createState(userId);

        return UriComponentsBuilder
                .fromUriString(authorizationUri)
                .queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("response_type", "code")
                .queryParam(
                        "scope",
                        "openid email profile " +
                                "https://www.googleapis.com/auth/drive " +
                                "https://www.googleapis.com/auth/drive.photos.readonly"
                )
                .queryParam("access_type", "offline")
                .queryParam("prompt", "consent")
                .queryParam("state", state)
                .build()
                .encode()
                .toUriString();
    }

    public ConnectedAccount handleCallback(String code, String state) {

        // 1. Validate state
        Jwt stateJwt = jwtDecoder.decode(state);

        String issuer = stateJwt.getClaimAsString("iss");

        if (!"storix".equals(issuer)) {
            throw new IllegalArgumentException("Invalid OAuth state");
        }

        Long userId = Long.parseLong(stateJwt.getSubject());

        // 2. Exchange authorization code for Google tokens
        Map<String, Object> tokenResponse = exchangeCodeForTokens(code);

        String accessToken = (String) tokenResponse.get("access_token");
        String refreshToken = (String) tokenResponse.get("refresh_token");

        Number expiresIn = (Number) tokenResponse.get("expires_in");

        LocalDateTime expiresAt = null;

        if (expiresIn != null) {
            expiresAt = LocalDateTime.now()
                    .plusSeconds(expiresIn.longValue());
        }

        // 3. Get Google account information
        Map<String, Object> userInfo = getGoogleUserInfo(accessToken);

        String accountEmail = (String) userInfo.get("email");

        // 4. Find Storix user
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        // 5. Check whether this Google account is already connected
        var existingAccount =
                connectedAccountRepository
                        .findByUserIdAndProviderAndAccountEmail(
                                userId,
                                StorageProvider.GOOGLE_DRIVE,
                                accountEmail
                        );

        ConnectedAccount account;

        if (existingAccount.isPresent()) {

            account = existingAccount.get();

            account.setAccessToken(accessToken);

            // Google may not return a new refresh token
            // if one already exists.
            if (refreshToken != null) {
                account.setRefreshToken(refreshToken);
            }

            account.setExpiresAt(expiresAt);
            account.setUpdatedAt(LocalDateTime.now());

        } else {

            account = ConnectedAccount.builder()
                    .user(user)
                    .provider(StorageProvider.GOOGLE_DRIVE)
                    .accountEmail(accountEmail)
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .expiresAt(expiresAt)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
        }

        return connectedAccountRepository.save(account);
    }

    private Map<String, Object> exchangeCodeForTokens(String code) {

        MultiValueMap<String, String> formData =
                new LinkedMultiValueMap<>();

        formData.add("code", code);
        formData.add("client_id", clientId);
        formData.add("client_secret", clientSecret);
        formData.add("redirect_uri", redirectUri);
        formData.add("grant_type", "authorization_code");

        return restClient
                .post()
                .uri(tokenUri)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(formData)
                .retrieve()
                .body(Map.class);
    }

    private Map<String, Object> getGoogleUserInfo(String accessToken) {

        return restClient
                .get()
                .uri("https://openidconnect.googleapis.com/v1/userinfo")
                .header(
                        "Authorization",
                        "Bearer " + accessToken
                )
                .retrieve()
                .body(Map.class);
    }

    private String createState(Long userId) {

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("storix")
                .subject(userId.toString())
                .claim("nonce", UUID.randomUUID().toString())
                .issuedAt(Instant.now())
                .expiresAt(
                        Instant.now().plusSeconds(600)
                )
                .build();

        return jwtEncoder
                .encode(
                        JwtEncoderParameters.from(claims)
                )
                .getTokenValue();
    }

}
