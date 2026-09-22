package com.storix.storix.file.service;

import com.storix.storix.account.entity.ConnectedAccount;
import com.storix.storix.account.repository.ConnectedAccountRepository;
import com.storix.storix.common.Enums.StorageProvider;
import com.storix.storix.file.dto.*;
import com.storix.storix.file.entity.File;
import com.storix.storix.file.exception.ResourceNotFoundException;
import com.storix.storix.file.provider.google.GoogleDriveProvider;
import com.storix.storix.file.repository.FileRepository;
import com.storix.storix.user.entity.User;
import com.storix.storix.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FileService {
    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final GoogleDriveProvider googleDriveProvider;
    private final ConnectedAccountRepository connectedAccountRepository;

    public List<FileResponse> getAllFiles(Long userId){

        return fileRepository.findAllByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
        }


//    public FileResponse createFile(FileRequest fileRequest, Long userId){
//
//        User user = userRepository.findById(userId)
//                .orElseThrow(()-> new ResourceNotFoundException(
//                        "user not found with id:" + userId));
//        File file = File.builder()
//                .name(fileRequest.getName())
//                .user(user)
//                .mimeType(fileRequest.getMimeType())
//                .category(fileRequest.getCategory())
//                .size(fileRequest.getSize())
//                .provider(fileRequest.getProvider())
//                .providerFileId(fileRequest.getProviderFileId())
//                .folderId(fileRequest.getFolderId())
//                .favorite(fileRequest.isFavorite())
//                .createdAt(LocalDateTime.now())
//                .updatedAt(LocalDateTime.now())
//                .build();
//        File savedFile = fileRepository.save(file);
//        return mapToResponse(savedFile);
//
//    }

    public FileResponse getFileById(Long id,Long userId){
        File file = fileRepository.findByIdAndUserId(id,userId)
                .orElseThrow( () ->new ResourceNotFoundException("File not found with id" + id));
        return mapToResponse(file);
    }

    public FileResponse updateFile(Long id, FileUpdateRequest fileUpdateRequest,Long userId){
        File file = fileRepository.findByIdAndUserId(id,userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "resource not found with id" + id
                ));
        file.setName(fileUpdateRequest.getName());
        file.setFolderId(fileUpdateRequest.getFolderId());
        file.setFavorite(fileUpdateRequest.isFavourite());

        File updatedFile = fileRepository.save(file);
        return mapToResponse(updatedFile);


    }


    public void syncGoogleDriveFiles(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        List<ConnectedAccount> accounts =
                connectedAccountRepository.findAllByUserId(userId)
                        .stream()
                        .filter(account ->
                                account.getProvider()
                                        == StorageProvider.GOOGLE_DRIVE
                        )
                        .toList();

        for (ConnectedAccount account : accounts) {

            // 1. Get files currently present in this Google Drive
            List<ProviderFile> providerFiles =
                    googleDriveProvider.listFiles(account);

            // 2. Add/update files in MySQL
            for (ProviderFile providerFile : providerFiles) {

                Optional<File> existingFile =
                        fileRepository
                                .findByUserIdAndConnectedAccountIdAndProviderFileId(
                                        userId,
                                        providerFile.getConnectedAccountId(),
                                        providerFile.getProviderFileId()
                                );

                if (existingFile.isPresent()) {

                    File file = existingFile.get();

                    file.setName(providerFile.getName());
                    file.setMimeType(providerFile.getMimeType());
                    file.setCategory(providerFile.getCategory());
                    file.setSize(providerFile.getSize());
                    file.setProviderFolderId(
                            providerFile.getProviderFolderId()
                    );
                    file.setUpdatedAt(LocalDateTime.now());

                    fileRepository.save(file);

                } else {

                    ConnectedAccount connectedAccount =
                            connectedAccountRepository.findById(
                                    providerFile.getConnectedAccountId()
                            ).orElseThrow(() ->
                                    new ResourceNotFoundException(
                                            "Connected account not found"
                                    )
                            );

                    File file = File.builder()
                            .user(user)
                            .connectedAccount(connectedAccount)
                            .name(providerFile.getName())
                            .mimeType(providerFile.getMimeType())
                            .category(providerFile.getCategory())
                            .size(providerFile.getSize())
                            .provider(StorageProvider.GOOGLE_DRIVE)
                            .providerFileId(
                                    providerFile.getProviderFileId()
                            )
                            .providerFolderId(
                                    providerFile.getProviderFolderId()
                            )
                            .favorite(false)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();

                    fileRepository.save(file);
                }
            }

            // 3. Get IDs that currently exist in this Google Drive
            List<String> existingProviderFileIds =
                    googleDriveProvider.getExistingFileIds(account);

            // 4. Get files Storix has for this Google account
            List<File> storedFiles =
                    fileRepository.findAllByUserIdAndConnectedAccountId(
                            userId,
                            account.getId()
                    );

            // 5. Delete local records that no longer exist on Google
            for (File storedFile : storedFiles) {

                if (!existingProviderFileIds.contains(
                        storedFile.getProviderFileId()
                )) {
                    fileRepository.delete(storedFile);
                }
            }
        }
    }

    public File getFileEntity(Long fileId, Long userId) {

        return fileRepository.findByIdAndUserId(fileId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "File not found"
                        )
                );
    }


    public void deleteFile(Long fileId, Long userId) {

        File file = fileRepository.findByIdAndUserId(
                fileId,
                userId
        ).orElseThrow(() ->
                new ResourceNotFoundException(
                        "File not found"
                )
        );

        googleDriveProvider.deleteFile(
                file.getConnectedAccount().getId(),
                file.getProviderFileId()
        );

        fileRepository.delete(file);
    }


    public FileResponse uploadFile(
            Long userId,
            Long connectedAccountId,
            MultipartFile multipartFile
    ) {

        if (multipartFile.isEmpty()) {
            throw new IllegalArgumentException(
                    "File cannot be empty"
            );
        }

        ConnectedAccount account =
                connectedAccountRepository
                        .findByIdAndUserId(
                                connectedAccountId,
                                userId
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Connected account not found"
                                )
                        );

        if (account.getProvider() != StorageProvider.GOOGLE_DRIVE) {
            throw new IllegalArgumentException(
                    "Only Google Drive upload is supported currently"
            );
        }

        try (InputStream inputStream =
                     multipartFile.getInputStream()) {

            ProviderFile providerFile =
                    googleDriveProvider.uploadFile(
                            connectedAccountId,
                            multipartFile.getOriginalFilename(),
                            multipartFile.getContentType(),
                            inputStream
                    );

            File file = File.builder()
                    .name(providerFile.getName())
                    .mimeType(providerFile.getMimeType())
                    .category(providerFile.getCategory())
                    .size(providerFile.getSize())
                    .provider(StorageProvider.GOOGLE_DRIVE)
                    .providerFileId(providerFile.getProviderFileId())
                    .providerFolderId(providerFile.getProviderFolderId())
                    .connectedAccount(account)
                    .user(account.getUser())
                    .favorite(false)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            File savedFile = fileRepository.save(file);

            return mapToResponse(savedFile);

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to read uploaded file",
                    e
            );
        }
    }


    public byte[] downloadFile(Long fileId, Long userId) {

        File file = fileRepository.findByIdAndUserId(fileId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("File not found")
                );

        return googleDriveProvider.downloadFile(
                file.getConnectedAccount().getId(),
                file.getProviderFileId()
        );
    }



    public List<FileResponse> searchFiles(
            Long userId,
            String query
    ) {

        return fileRepository
                .findAllByUserIdAndNameContainingIgnoreCase(
                        userId,
                        query
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    public List<FileResponse> getFolderFiles(
            Long userId,
            Long connectedAccountId,
            String providerFolderId
    ) {

        connectedAccountRepository
                .findByIdAndUserId(
                        connectedAccountId,
                        userId
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Connected account not found"
                        )
                );

        String folderId = providerFolderId;

        if (folderId == null) {
            folderId =
                    googleDriveProvider
                            .getRootFolderIdForAccount(
                                    connectedAccountId
                            );
        }

        return fileRepository
                .findAllByUserIdAndConnectedAccountIdAndProviderFolderId(
                        userId,
                        connectedAccountId,
                        folderId
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private FileResponse mapToResponse(File file) {

        return FileResponse.builder()
                .id(file.getId())
                .name(file.getName())
                .mimeType(file.getMimeType())
                .category(file.getCategory())
                .size(file.getSize())
                .provider(file.getProvider())
                .providerFileId(file.getProviderFileId())
                .providerFolderId(file.getProviderFolderId())
                .folderId(file.getFolderId())
                .favorite(file.isFavorite())
                .connectedAccountId(file.getConnectedAccount().getId())
                .accountEmail(file.getConnectedAccount().getAccountEmail())

                .build();
    }

    public List<FolderResponse> getFolders(
            Long userId,
            Long connectedAccountId
    ) {

        return fileRepository
                .findAllByUserIdAndConnectedAccountIdAndCategory(
                        userId,
                        connectedAccountId,
                        "FOLDERS"
                )
                .stream()
                .map(file -> new FolderResponse(
                        file.getId(),
                        file.getName(),
                        file.getProviderFileId(),
                        file.getProviderFolderId(),
                        file.getConnectedAccount().getId()
                ))
                .toList();
    }

    public List<BreadcrumbResponse> getBreadcrumbs(
            Long userId,
            Long connectedAccountId,
            String providerFolderId
    ) {

        List<File> folders =
                fileRepository
                        .findAllByUserIdAndConnectedAccountIdAndCategory(
                                userId,
                                connectedAccountId,
                                "FOLDERS"
                        );

        List<BreadcrumbResponse> breadcrumbs =
                new ArrayList<>();

        String currentFolderId = providerFolderId;

        while (currentFolderId != null) {

            String finalFolderId = currentFolderId;

            File currentFolder = folders.stream()
                    .filter(folder ->
                            folder.getProviderFileId()
                                    .equals(finalFolderId)
                    )
                    .findFirst()
                    .orElse(null);

            if (currentFolder == null) {
                break;
            }

            breadcrumbs.add(
                    new BreadcrumbResponse(
                            currentFolder.getName(),
                            currentFolder.getProviderFileId()
                    )
            );

            currentFolderId =
                    currentFolder.getProviderFolderId();
        }

        Collections.reverse(breadcrumbs);

        breadcrumbs.add(
                0,
                new BreadcrumbResponse(
                        "My Drive",
                        null
                )
        );

        return breadcrumbs;
    }

}
