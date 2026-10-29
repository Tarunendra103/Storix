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
import org.springframework.http.ContentDisposition;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.nio.charset.StandardCharsets;
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
    public ResponseEntity<SyncResponse> syncFiles(
            Authentication authentication
    ) {
        Long userId = Long.parseLong(authentication.getName());

        SyncResponse result = fileService.syncGoogleDriveFiles(userId);

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<StreamingResponseBody> downloadFile(
            @PathVariable Long id,
            Authentication authentication
    ) {
        return contentResponse(id, authentication, false);
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<StreamingResponseBody> previewFile(@PathVariable Long id, Authentication authentication) {
        return contentResponse(id, authentication, true);
    }

    private ResponseEntity<StreamingResponseBody> contentResponse(Long id, Authentication authentication, boolean inline) {
        Long userId = Long.parseLong(authentication.getName());
        File file = fileService.getFileEntity(id, userId);
        if ("application/vnd.google-apps.folder".equalsIgnoreCase(file.getMimeType())) {
            throw new IllegalArgumentException("Folders cannot be downloaded");
        }
        DownloadMetadata metadata = downloadMetadata(file);
        StreamingResponseBody stream = outputStream -> fileService.downloadFile(id, userId, outputStream);
        ContentDisposition disposition = (inline ? ContentDisposition.inline() : ContentDisposition.attachment())
                .filename(metadata.fileName(), StandardCharsets.UTF_8).build();
        return ResponseEntity.ok()
                .contentType(metadata.mediaType())
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .header(HttpHeaders.CACHE_CONTROL, "private, no-store")
                .body(stream);
    }

    private DownloadMetadata downloadMetadata(File file) {
        String originalMimeType = file.getMimeType();
        String fileName = file.getName();
        if ("application/vnd.google-apps.document".equals(originalMimeType)) {
            return new DownloadMetadata(MediaType.APPLICATION_PDF, withExtension(fileName, ".pdf"));
        }
        if ("application/vnd.google-apps.spreadsheet".equals(originalMimeType)) {
            return new DownloadMetadata(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"), withExtension(fileName, ".xlsx"));
        }
        if ("application/vnd.google-apps.presentation".equals(originalMimeType)) {
            return new DownloadMetadata(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.presentationml.presentation"), withExtension(fileName, ".pptx"));
        }
        try {
            return new DownloadMetadata(originalMimeType == null ? MediaType.APPLICATION_OCTET_STREAM : MediaType.parseMediaType(originalMimeType), fileName);
        } catch (IllegalArgumentException ignored) {
            return new DownloadMetadata(MediaType.APPLICATION_OCTET_STREAM, fileName);
        }
    }

    private String withExtension(String fileName, String extension) {
        return fileName != null && fileName.toLowerCase().endsWith(extension) ? fileName : fileName + extension;
    }

    private record DownloadMetadata(MediaType mediaType, String fileName) { }



    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<FileResponse> uploadFile(
            @RequestParam Long connectedAccountId,
            @RequestParam MultipartFile file,
            @RequestParam(required = false) Long parentId,
            Authentication authentication
    ) {

        Long userId =
                Long.parseLong(authentication.getName());

        FileResponse response =
                fileService.uploadFile(
                        userId,
                        connectedAccountId,
                        file,
                        parentId
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/folders")
    public ResponseEntity<FileResponse> createFolder(
            @RequestParam Long connectedAccountId,
            @RequestParam String name,
            @RequestParam(required = false) Long parentId,
            Authentication authentication
    ) {
        Long userId = Long.parseLong(authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(fileService.createFolder(userId, connectedAccountId, name, parentId));
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
            @RequestParam(required = false) String providerFolderId,
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
