package com.storix.storix.file.service;

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
@Service
@RequiredArgsConstructor
public class FileService {
    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final GoogleDriveProvider googleDriveProvider;

    public List<FileResponse> getAllFiles(Long userId){

            return googleDriveProvider.listFiles(userId)
                    .stream()
                    .map(providerFile -> FileResponse.builder()
                            .id(null)
                            .name(providerFile.getName())
                            .mimeType(providerFile.getMimeType())
                            .category(providerFile.getCategory())
                            .size(providerFile.getSize())
                            .provider(StorageProvider.GOOGLE_DRIVE)
                            .providerFileId(providerFile.getProviderFileId())
                            .folderId(null)
                            .favorite(false)
                            .build()
                    )
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
                .build();
    }

}
