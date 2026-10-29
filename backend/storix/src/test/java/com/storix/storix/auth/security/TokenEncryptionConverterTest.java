package com.storix.storix.auth.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

class TokenEncryptionConverterTest {
    private static final String TEST_KEY = "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=";

    @Test
    void encryptsTokensWithRandomizedCiphertextAndDecryptsThemAgain() {
        TokenEncryptionConverter converter = new TokenEncryptionConverter(TEST_KEY);

        String firstCiphertext = converter.convertToDatabaseColumn("refresh-token-value");
        String secondCiphertext = converter.convertToDatabaseColumn("refresh-token-value");

        assertNotEquals("refresh-token-value", firstCiphertext);
        assertNotEquals(firstCiphertext, secondCiphertext);
        assertEquals("refresh-token-value", converter.convertToEntityAttribute(firstCiphertext));
    }

    @Test
    void keepsLegacyPlaintextReadableDuringSafeRollout() {
        TokenEncryptionConverter converter = new TokenEncryptionConverter(TEST_KEY);

        assertEquals("legacy-token", converter.convertToEntityAttribute("legacy-token"));
    }
}
