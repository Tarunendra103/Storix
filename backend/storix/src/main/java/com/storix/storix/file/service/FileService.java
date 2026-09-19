package com.storix.storix.file.service;

import com.storix.storix.account.repository.ConnectedAccountRepository;
import com.storix.storix.common.Enums.StorageProvider;
import com.storix.storix.file.dto.FileRequest;
import com.storix.storix.file.dto.FileResponse;
import com.storix.storix.file.dto.FileUpdateRequest;
import com.storix.storix.file.dto.ProviderFile;
import com.storix.storix.file.entity.File;
import com.storix.storix.file.exception.ResourceNotFoundException;
import com.storix.storix.file.provider.google.GoogleDriveProvider;
import com.storix.storix.file.repository.FileRepository;
import com.storix.storix.user.entity.User;
import com.storix.storix.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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


    public FileResponse createFile(FileRequest fileRequest, Long userId){

        User user = userRepository.findById(userId)
                .orElseThrow(()-> new ResourceNotFoundException(
                        "user not found with id:" + userId));
        File file = File.builder()
                .name(fileRequest.getName())
                .user(user)
                .mimeType(fileRequest.getMimeType())
                .category(fileRequest.getCategory())
                .size(fileRequest.getSize())
                .provider(fileRequest.getProvider())
                .providerFileId(fileRequest.getProviderFileId())
                .folderId(fileRequest.getFolderId())
                .favorite(fileRequest.isFavorite())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        File savedFile = fileRepository.save(file);
        return mapToResponse(savedFile);

    }

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

    public void  deleteFile(Long id,Long userId){
        File file = fileRepository.findByIdAndUserId(id,userId)
                .orElseThrow(()-> new ResourceNotFoundException(
                        "resource not found to delete with id" + id
                ));
        fileRepository.delete(file);
    }

    public void syncGoogleDriveFiles(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );

        List<ProviderFile> providerFiles =
                googleDriveProvider.listFiles(userId);

        for (ProviderFile providerFile : providerFiles) {

            Optional<File> existingFile =
                    fileRepository.findByUserIdAndProviderAndProviderFileId(
                            userId,
                            StorageProvider.GOOGLE_DRIVE,
                            providerFile.getProviderFileId()
                    );

            if (existingFile.isPresent()) {

                File file = existingFile.get();

                file.setName(providerFile.getName());
                file.setMimeType(providerFile.getMimeType());
                file.setSize(providerFile.getSize());
                file.setCategory(providerFile.getCategory());
                file.setUpdatedAt(LocalDateTime.now());
                file.setProviderFolderId(
                        providerFile.getProviderFolderId()
                );

                fileRepository.save(file);

            } else {

                File file = File.builder()
                        .user(user)
                        .connectedAccount(
                                connectedAccountRepository.findById(
                                        providerFile.getConnectedAccountId()
                                ).orElseThrow(() ->
                                        new ResourceNotFoundException(
                                                "Connected account not found"
                                        )
                                )
                        )
                        .name(providerFile.getName())
                        .mimeType(providerFile.getMimeType())
                        .category(providerFile.getCategory())
                        .size(providerFile.getSize())
                        .provider(StorageProvider.GOOGLE_DRIVE)
                        .providerFileId(providerFile.getProviderFileId())
                        .providerFolderId(providerFile.getProviderFolderId())
                        .favorite(false)
                        .createdAt(LocalDateTime.now())
                        .updatedAt(LocalDateTime.now())
                        .build();

                fileRepository.save(file);
            }

        }
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
                .folderId(file.getFolderId())
                .favorite(file.isFavorite())
                .connectedAccountId(file.getConnectedAccount().getId())
                .accountEmail(file.getConnectedAccount().getAccountEmail())

                .build();
    }

}
