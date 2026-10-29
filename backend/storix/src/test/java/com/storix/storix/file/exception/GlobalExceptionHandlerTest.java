package com.storix.storix.file.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {
    @Test
    void returnsTheSafeProviderStatusAndMessage() {
        GlobalExceptionHandler handler = new GlobalExceptionHandler();

        ResponseEntity<GlobalExceptionHandler.ApiError> response = handler.handleCloudProviderFailure(
                new CloudProviderException(HttpStatus.SERVICE_UNAVAILABLE,
                        "Google Drive is temporarily unavailable. Please try again.", null));

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertEquals("Google Drive is temporarily unavailable. Please try again.", response.getBody().message());
    }
}
