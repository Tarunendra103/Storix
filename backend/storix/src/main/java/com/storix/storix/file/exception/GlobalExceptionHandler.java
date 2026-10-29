package com.storix.storix.file.exception;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleResourceNotFound(
            ResourceNotFoundException resourceNotFoundException){
        ApiError response = new ApiError(
             HttpStatus.NOT_FOUND.value(),
                     resourceNotFoundException.getMessage(),
                     LocalDateTime.now()
                     );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);

        }

        @ExceptionHandler(EmailAlreadyExistsException.class)
        public ResponseEntity<ApiError> handleEmailAlreadyExists(
                EmailAlreadyExistsException emailAlreadyExistsException){

            ApiError response = new ApiError(
                    HttpStatus.CONFLICT.value(),
                   emailAlreadyExistsException.getMessage(),
                    LocalDateTime.now()
            );
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        @ExceptionHandler({IllegalArgumentException.class, MethodArgumentNotValidException.class})
        public ResponseEntity<ApiError> handleBadRequest(Exception exception) {
            return ResponseEntity.badRequest().body(new ApiError(
                    HttpStatus.BAD_REQUEST.value(), "The request is invalid.", LocalDateTime.now()));
        }

        @ExceptionHandler(IllegalStateException.class)
        public ResponseEntity<ApiError> handleUnavailable(IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new ApiError(
                    HttpStatus.CONFLICT.value(), exception.getMessage(), LocalDateTime.now()));
        }

        @ExceptionHandler(CloudProviderException.class)
        public ResponseEntity<ApiError> handleCloudProviderFailure(CloudProviderException exception) {
            HttpStatus status = exception.getStatus();
            return ResponseEntity.status(status).body(new ApiError(
                    status.value(), exception.getMessage(), LocalDateTime.now()));
        }

        @ExceptionHandler(RuntimeException.class)
        public ResponseEntity<ApiError> handleProviderFailure(RuntimeException exception) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(new ApiError(
                    HttpStatus.BAD_GATEWAY.value(),
                    "The cloud provider request could not be completed. Please try again.",
                    LocalDateTime.now()));
        }

        public record ApiError(
                int status,
                String message,
                LocalDateTime timeStamp
        ){
    }

}
