package com.storix.storix.file.controller;

import com.storix.storix.file.dto.*;
import com.storix.storix.file.entity.File;
import com.storix.storix.file.provider.google.GoogleDriveProvider;
import com.storix.storix.file.service.FileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {
    private final FileService fileService;
    private final GoogleDriveProvider googleDriveProvider;




    @GetMapping
    public ResponseEntity<List<FileResponse>> getAllFiles(Authentication authentication){
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.ok(fileService.getAllFiles(userId));
    }

//    @PostMapping
//    public ResponseEntity<FileResponse> createFile(
//            @Valid @RequestBody FileRequest fileRequest,Authentication authentication){
//        Long userId = Long.parseLong(authentication.getName());
//        return ResponseEntity
//                .status(HttpStatus.CREATED)
//                .body(fileService.createFile(fileRequest,userId));
//    }

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
    public ResponseEntity<Void> deleteFile(
            @PathVariable Long id,
            Authentication authentication
    ) {
        Long userId = Long.parseLong(authentication.getName());

        fileService.deleteFile(id, userId);

        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sync")
    public ResponseEntity<Void> syncFiles(
            Authentication authentication
    ) {
        Long userId = Long.parseLong(authentication.getName());

        fileService.syncGoogleDriveFiles(userId);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadFile(
            @PathVariable Long id,
            Authentication authentication
    ) {

        Long userId = Long.parseLong(authentication.getName());

        File file = fileService.getFileEntity(id, userId);

        byte[] data = fileService.downloadFile(id, userId);

        String originalMimeType = file.getMimeType();
        MediaType mediaType = MediaType.APPLICATION_OCTET_STREAM;
        String fileName = file.getName();

        if (originalMimeType != null) {
            if (originalMimeType.equals("application/vnd.google-apps.document")) {
                mediaType = MediaType.APPLICATION_PDF;
                if (!fileName.toLowerCase().endsWith(".pdf")) {
                    fileName += ".pdf";
                }
            } else if (originalMimeType.equals("application/vnd.google-apps.spreadsheet")) {
                mediaType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                if (!fileName.toLowerCase().endsWith(".xlsx")) {
                    fileName += ".xlsx";
                }
            } else if (originalMimeType.equals("application/vnd.google-apps.presentation")) {
                mediaType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.presentationml.presentation");
                if (!fileName.toLowerCase().endsWith(".pptx")) {
                    fileName += ".pptx";
                }
            } else {
                try {
                    mediaType = MediaType.parseMediaType(originalMimeType);
                } catch (Exception ignored) {
                    mediaType = MediaType.APPLICATION_OCTET_STREAM;
                }
            }
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + fileName + "\""
                )
                .body(data);
    }



    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<FileResponse> uploadFile(
            @RequestParam Long connectedAccountId,
            @RequestParam MultipartFile file,
            Authentication authentication
    ) {

        Long userId =
                Long.parseLong(authentication.getName());

        FileResponse response =
                fileService.uploadFile(
                        userId,
                        connectedAccountId,
                        file
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping("/search")
    public ResponseEntity<List<FileResponse>> searchFiles(
            @RequestParam String query,
            Authentication authentication
    ) {

        Long userId =
                Long.parseLong(authentication.getName());

        List<FileResponse> files =
                fileService.searchFiles(userId, query);

        return ResponseEntity.ok(files);
    }

    @GetMapping("/folder")
    public ResponseEntity<List<FileResponse>> getFolderFiles(
            @RequestParam Long connectedAccountId,
            @RequestParam String providerFolderId,
            Authentication authentication
    ) {

        Long userId =
                Long.parseLong(authentication.getName());

        return ResponseEntity.ok(
                fileService.getFolderFiles(
                        userId,
                        connectedAccountId,
                        providerFolderId
                )
        );
    }

    @GetMapping("/folders")
    public ResponseEntity<List<FolderResponse>> getFolders(
            @RequestParam Long connectedAccountId,
            Authentication authentication
    ) {

        Long userId =
                Long.parseLong(authentication.getName());

        return ResponseEntity.ok(
                fileService.getFolders(
                        userId,
                        connectedAccountId
                )
        );
    }


    @GetMapping("/breadcrumbs")
    public ResponseEntity<List<BreadcrumbResponse>> getBreadcrumbs(
            @RequestParam Long connectedAccountId,
            @RequestParam(required = false) String providerFolderId,
            Authentication authentication
    ) {

        Long userId =
                Long.parseLong(authentication.getName());

        return ResponseEntity.ok(
                fileService.getBreadcrumbs(
                        userId,
                        connectedAccountId,
                        providerFolderId
                )
        );
    }


}
