package com.storix.storix.file.exception;


import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

import org.springframework.http.ResponseEntity;

import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException resourceNotFoundException){
        ErrorResponse response = new ErrorResponse(
             HttpStatus.NOT_FOUND.value(),
                     resourceNotFoundException.getMessage(),
                     LocalDateTime.now()
                     );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);

        }
        public record ErrorResponse(
                int status,
                String message,
                LocalDateTime timeStamp
        ){
    }
}
