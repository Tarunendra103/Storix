package com.storix.storix.account.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleOAuthService {
    private final JwtEncoder jwtEncoder;

    @Value("${google.oauth.client-id}")
    private String clientId;

    @Value("${google.oauth.redirect-uri}")
    private String redirectUri;

    @Value("${google.oauth.authorization-uri}")
    private String authorizationUri;

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
                .toUriString();
    }

    private String createState(Long userId) {

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("storix")
                .subject(userId.toString())
                .claim("nonce", UUID.randomUUID().toString())
                .issuedAt(Instant.now())
                .expiresAt(Instant.now().plusSeconds(600))
                .build();

        return jwtEncoder
                .encode(JwtEncoderParameters.from(claims))
                .getTokenValue();
    }

}
