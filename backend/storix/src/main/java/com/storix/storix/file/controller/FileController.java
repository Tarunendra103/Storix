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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {
    private final FileService fileService;
    @GetMapping
    public ResponseEntity<List<FileResponse>> getAllFiles(){
        return ResponseEntity.ok(fileService.getAllFiles());
    }

    @PostMapping
    public ResponseEntity<FileResponse> createFile(
            @Valid @RequestBody FileRequest fileRequest){
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(fileService.createFile(fileRequest));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FileResponse> getFileById(@PathVariable Long id){
        return  ResponseEntity.ok(fileService.getFileById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FileResponse> updateFile(@PathVariable Long id,
                                                  @Valid @RequestBody FileUpdateRequest fileUpdateRequest){
        return ResponseEntity.ok(fileService.updateFile(id, fileUpdateRequest));

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long id){
//        return ResponseEntity.ok("file is deleted successfully")
        fileService.deleteFile(id);
        return ResponseEntity.noContent().build();
    }

}
