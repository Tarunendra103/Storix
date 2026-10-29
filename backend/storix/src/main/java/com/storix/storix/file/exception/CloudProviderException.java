package com.storix.storix.file.exception;

import org.springframework.http.HttpStatus;

/**
 * A safe, client-facing description of a cloud-provider failure. The cause is
 * retained for server-side diagnostics but is never returned to the browser.
 */
public class CloudProviderException extends RuntimeException {
    private final HttpStatus status;

    public CloudProviderException(HttpStatus status, String message, Throwable cause) {
        super(message, cause);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
