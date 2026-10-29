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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.HashSet;
import java.util.Set;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FileService {
    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final GoogleDriveProvider googleDriveProvider;
    private final ConnectedAccountRepository connectedAccountRepository;
    private static final Logger logger = LoggerFactory.getLogger(FileService.class);

    public List<FileResponse> getAllFiles(Long userId){
        List<File> files = fileRepository.findAllByUserId(userId);
        logger.info("Found {} files for userId: {}", files.size(), userId);
        return files.stream()
                .map(this::mapToResponse)
                .toList();
    }
    public FileResponse getFileById(Long id,Long userId){
        File file = fileRepository.findByIdAndUserId(id,userId)
                .orElseThrow( () ->new ResourceNotFoundException("File not found with id" + id));
        return mapToResponse(file);
    }

    @Transactional
    public FileResponse updateFile(Long id, FileUpdateRequest fileUpdateRequest,Long userId){
        File file = fileRepository.findByIdAndUserId(id,userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "resource not found with id" + id
                ));
        if (fileUpdateRequest.getName() != null && !fileUpdateRequest.getName().isBlank()
                && !file.getName().equals(fileUpdateRequest.getName().trim())) {
            ProviderFile providerFile = googleDriveProvider.renameFile(
                    file.getConnectedAccount().getId(), file.getProviderFileId(), fileUpdateRequest.getName().trim());
            file.setName(providerFile.getName());
            file.setMimeType(providerFile.getMimeType());
            file.setCategory(FileCategory.classify(providerFile.getMimeType(), providerFile.getName()));
        }
        if (fileUpdateRequest.getFavourite() != null) {
            file.setFavorite(fileUpdateRequest.getFavourite());
        }
        file.setUpdatedAt(LocalDateTime.now());

        File updatedFile = fileRepository.save(file);
        return mapToResponse(updatedFile);


    }


    @Transactional
    public SyncResponse syncGoogleDriveFiles(Long userId) {

        logger.info("Starting Google Drive sync for userId: {}", userId);

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

        logger.info("Found {} Google Drive accounts for userId: {}", accounts.size(), userId);

        int syncedAccounts = 0;
        int failedAccounts = 0;
        for (ConnectedAccount account : accounts) {
            try {
            logger.info("Processing accountId: {} (email: {})", account.getId(), account.getAccountEmail());

            // The list operation is paginated and must finish successfully before
            // reconciliation is allowed. This prevents a partial provider failure
            // from deleting known-good local metadata.
            List<ProviderFile> providerFiles =
                    googleDriveProvider.listFiles(account);
            logger.info("Received {} files from Google Drive for accountId: {}", providerFiles.size(), account.getId());
            Set<String> providerFileIds = new HashSet<>();
            // Load the account catalog once. Looking up each Drive item separately
            // becomes very slow for a large photo/video library.
            List<File> storedFiles = fileRepository.findAllByUserIdAndConnectedAccountId(userId, account.getId());
            Map<String, File> storedByProviderId = storedFiles.stream()
                    .collect(java.util.stream.Collectors.toMap(File::getProviderFileId, file -> file, (first, ignored) -> first));
            List<File> filesToSave = new ArrayList<>();

            // Add/update files in MySQL.
            int updatedCount = 0;
            int insertedCount = 0;
            for (ProviderFile providerFile : providerFiles) {
                if (providerFile.getProviderFileId() == null || !providerFileIds.add(providerFile.getProviderFileId())) {
                    continue;
                }
                File file = storedByProviderId.get(providerFile.getProviderFileId());

                if (file != null) {

                    file.setName(providerFile.getName());
                    file.setMimeType(providerFile.getMimeType());
                    file.setCategory(providerFile.getCategory());
                    file.setSize(providerFile.getSize());
                    file.setProviderFolderId(
                            providerFile.getProviderFolderId()
                    );
                    file.setUpdatedAt(LocalDateTime.now());

                    filesToSave.add(file);
                    updatedCount++;
                    if (updatedCount <= 5) { // Log first 5 updates
                        logger.info("Updated file: id={}, name={}, mimeType={}, category={}",
                                file.getId(), file.getName(), file.getMimeType(), file.getCategory());
                    }

                } else {

                    File newFile = File.builder()
                            .user(user)
                            .connectedAccount(account)
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

                    filesToSave.add(newFile);
                    insertedCount++;
                    if (insertedCount <= 5) { // Log first 5 inserts
                        logger.info("Inserted file: name={}, mimeType={}, category={}",
                                newFile.getName(), newFile.getMimeType(), newFile.getCategory());
                    }
                }
            }
            if (!filesToSave.isEmpty()) {
                fileRepository.saveAll(filesToSave);
            }
            logger.info("AccountId: {} - Updated: {}, Inserted: {}", account.getId(), updatedCount, insertedCount);

            // Reconcile only from the successfully completed listing above.
            logger.info("Found {} stored files for accountId: {} before reconciliation", storedFiles.size(), account.getId());

            List<File> staleFiles = storedFiles.stream()
                    .filter(storedFile -> !providerFileIds.contains(storedFile.getProviderFileId()))
                    .toList();
            if (!staleFiles.isEmpty()) {
                fileRepository.deleteAll(staleFiles);
            }
            logger.info("Deleted {} files for accountId: {} during reconciliation", staleFiles.size(), account.getId());

            // Quota is supplementary metadata: retain the last known value if it
            // cannot be fetched after an otherwise successful file sync.
            try {
                googleDriveProvider.refreshStorageQuota(account);
                logger.info("Refreshed storage quota for accountId: {}", account.getId());
            } catch (RuntimeException ignored) {
                // The file listing remains authoritative and successfully synced.
                logger.warn("Failed to refresh storage quota for accountId: {}", account.getId());
            }
            syncedAccounts++;
            } catch (RuntimeException exception) {
                failedAccounts++;
                // Keep the remaining connected accounts syncing. Do not include
                // provider tokens or upstream response bodies in logs.
                logger.warn("Sync failed for accountId: {}; continuing with remaining accounts: {}",
                        account.getId(), exception.getMessage());
            }
        }
        logger.info("Completed Google Drive sync for userId: {}. Successful accounts: {}, failed accounts: {}",
                userId, syncedAccounts, failedAccounts);
        return new SyncResponse(syncedAccounts, failedAccounts);
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

        // The Drive operation has completed, so local metadata can now be
        // removed. Quota is supplementary; a delayed quota response must not
        // resurrect metadata for a file already deleted in Drive.
        try {
            googleDriveProvider.refreshStorageQuota(file.getConnectedAccount());
        } catch (RuntimeException exception) {
            logger.warn("Deleted fileId: {} but could not refresh quota for connectedAccountId: {}",
                    fileId, file.getConnectedAccount().getId());
        }
    }

    /** Validates provider access before a streaming response commits HTTP 200. */
    public void verifyFileContentAccess(Long fileId, Long userId) {
        File file = getFileEntity(fileId, userId);
        googleDriveProvider.verifyContentAccess(
                file.getConnectedAccount().getId(), file.getProviderFileId());
    }


    public FileResponse uploadFile(
            Long userId,
            Long connectedAccountId,
            MultipartFile multipartFile,
            Long parentId
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

        String providerFolderId = null;
        if (parentId != null) {
            File parent = fileRepository.findByIdAndUserId(parentId, userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent folder not found"));
            if (!parent.getConnectedAccount().getId().equals(account.getId()) || !isFolder(parent)) {
                throw new IllegalArgumentException("Parent folder must belong to the selected connected account");
            }
            providerFolderId = parent.getProviderFileId();
        }

        try (InputStream inputStream =
                     multipartFile.getInputStream()) {

            ProviderFile providerFile =
                    googleDriveProvider.uploadFile(
                            connectedAccountId,
                            multipartFile.getOriginalFilename(),
                            multipartFile.getContentType(),
                            inputStream,
                            providerFolderId
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


    public void downloadFile(Long fileId, Long userId, OutputStream outputStream) {

        File file = fileRepository.findByIdAndUserId(fileId, userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("File not found")
                );

        if (isFolder(file)) {
            throw new IllegalArgumentException("Folders cannot be downloaded");
        }
        googleDriveProvider.downloadFile(
                file.getConnectedAccount().getId(),
                file.getProviderFileId(),
                outputStream
        );
    }

    @Transactional
    public FileResponse createFolder(Long userId, Long connectedAccountId, String folderName, Long parentId) {
        if (folderName == null || folderName.isBlank()) {
            throw new IllegalArgumentException("Folder name is required");
        }
        ConnectedAccount account = connectedAccountRepository.findByIdAndUserId(connectedAccountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Connected account not found"));
        String providerParentId = null;
        if (parentId != null) {
            File parent = fileRepository.findByIdAndUserId(parentId, userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent folder not found"));
            if (!parent.getConnectedAccount().getId().equals(account.getId()) || !isFolder(parent)) {
                throw new IllegalArgumentException("Parent folder must belong to the selected connected account");
            }
            providerParentId = parent.getProviderFileId();
        }
        ProviderFile providerFile = googleDriveProvider.createFolder(connectedAccountId, folderName.trim(), providerParentId);
        File saved = fileRepository.save(File.builder()
                .user(account.getUser()).connectedAccount(account).name(providerFile.getName())
                .mimeType(providerFile.getMimeType()).category(FileCategory.FOLDERS).size(providerFile.getSize())
                .provider(StorageProvider.GOOGLE_DRIVE).providerFileId(providerFile.getProviderFileId())
                .providerFolderId(providerFile.getProviderFolderId()).favorite(false)
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build());
        return mapToResponse(saved);
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

        String category = FileCategory.normalize(file.getCategory(), file.getMimeType(), file.getName());
        boolean isFolder = FileCategory.FOLDERS.equals(category);

        return FileResponse.builder()
                .id(file.getId())
                .name(file.getName())
                .mimeType(file.getMimeType())
                .category(category.toLowerCase())
                .size(file.getSize())
                .provider(file.getProvider())
                .providerFileId(file.getProviderFileId())
                .providerFolderId(file.getProviderFolderId())
                .folderId(file.getFolderId())
                .favorite(file.isFavorite())
                .connectedAccountId(file.getConnectedAccount().getId())
                .accountEmail(file.getConnectedAccount().getAccountEmail())
                .createdAt(file.getCreatedAt())
                .updatedAt(file.getUpdatedAt())
                .isFolder(isFolder)
                .build();
    }

    private boolean isFolder(File file) {
        return FileCategory.FOLDERS.equals(FileCategory.normalize(file.getCategory(), file.getMimeType(), file.getName()));
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
