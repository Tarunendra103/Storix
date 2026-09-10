package com.storix.storix.file.controller;

import com.storix.storix.file.dto.FileRequest;
import com.storix.storix.file.dto.FileResponse;
import com.storix.storix.file.dto.FileUpdateRequest;
import com.storix.storix.file.entity.File;
import com.storix.storix.file.service.FileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {
    private final FileService fileService;
    @GetMapping
    public ResponseEntity<List<FileResponse>> getAllFiles(Authentication authentication){
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(fileService.getAllFiles(userId));
    }

    @PostMapping
    public ResponseEntity<FileResponse> createFile(
            @Valid @RequestBody FileRequest fileRequest,Authentication authentication){
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(fileService.createFile(fileRequest,userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FileResponse> getFileById(
            @PathVariable Long id,Authentication authentication){
        Long userId = Long.parseLong(authentication.getName());
        return  ResponseEntity.ok(fileService.getFileById(id,userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FileResponse> updateFile(@PathVariable Long id,
                                                  @Valid @RequestBody FileUpdateRequest fileUpdateRequest,
                                                   Authentication authentication){
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(fileService.updateFile(id, fileUpdateRequest,userId));

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long id,
                                           Authentication authentication){
//        return ResponseEntity.ok("file is deleted successfully")
        Long userId = Long.parseLong(authentication.getName());
        fileService.deleteFile(id,userId);
        return ResponseEntity.noContent().build();
    }

}
