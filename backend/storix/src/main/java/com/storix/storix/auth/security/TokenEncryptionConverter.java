package com.storix.storix.auth.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Encrypts provider OAuth tokens before JPA writes them to the database.
 *
 * Legacy unprefixed rows are read unchanged so existing users are not locked
 * out during deployment. Saving a legacy account, or reconnecting it, writes
 * the current token values in the encrypted v1 representation.
 */
@Component
@Converter
public class TokenEncryptionConverter implements AttributeConverter<String, String> {
    private static final String PREFIX = "enc:v1:";
    private static final int IV_LENGTH_BYTES = 12;
    private static final int GCM_TAG_LENGTH_BITS = 128;

    private final SecretKey key;
    private final SecureRandom secureRandom = new SecureRandom();

    public TokenEncryptionConverter(@Value("${app.token-encryption-key}") String encodedKey) {
        byte[] keyBytes;
        try {
            keyBytes = Base64.getDecoder().decode(encodedKey);
        } catch (IllegalArgumentException exception) {
            throw new IllegalStateException("TOKEN_ENCRYPTION_KEY must be Base64-encoded", exception);
        }
        if (keyBytes.length != 32) {
            throw new IllegalStateException("TOKEN_ENCRYPTION_KEY must contain exactly 32 random bytes");
        }
        this.key = new SecretKeySpec(keyBytes, "AES");
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        if (attribute == null || attribute.isBlank()) {
            return attribute;
        }
        try {
            byte[] iv = new byte[IV_LENGTH_BYTES];
            secureRandom.nextBytes(iv);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));
            byte[] ciphertext = cipher.doFinal(attribute.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            byte[] payload = ByteBuffer.allocate(iv.length + ciphertext.length)
                    .put(iv)
                    .put(ciphertext)
                    .array();
            return PREFIX + Base64.getUrlEncoder().withoutPadding().encodeToString(payload);
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Unable to encrypt connected-account token", exception);
        }
    }

    @Override
    public String convertToEntityAttribute(String databaseValue) {
        if (databaseValue == null || databaseValue.isBlank() || !databaseValue.startsWith(PREFIX)) {
            return databaseValue;
        }
        try {
            byte[] payload = Base64.getUrlDecoder().decode(databaseValue.substring(PREFIX.length()));
            if (payload.length <= IV_LENGTH_BYTES) {
                throw new IllegalStateException("Encrypted connected-account token is malformed");
            }
            ByteBuffer buffer = ByteBuffer.wrap(payload);
            byte[] iv = new byte[IV_LENGTH_BYTES];
            buffer.get(iv);
            byte[] ciphertext = new byte[buffer.remaining()];
            buffer.get(ciphertext);
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(GCM_TAG_LENGTH_BITS, iv));
            return new String(cipher.doFinal(ciphertext), java.nio.charset.StandardCharsets.UTF_8);
        } catch (GeneralSecurityException | IllegalArgumentException exception) {
            throw new IllegalStateException("Unable to decrypt connected-account token; reconnect the account", exception);
        }
    }
}
