package com.storix.storix.file.provider;

import com.storix.storix.file.dto.ProviderFile;
import com.storix.storix.file.entity.File;

import java.util.List;

public interface CloudStorageProvider {
    List<ProviderFile> listFiles(Long userId);

    ProviderFile getFile(Long userId, String providerFileId);

    byte[] downloadFile(Long userId, String providerFileId);

    void deleteFile(Long userId, String providerFileId);

    ProviderFile renameFile(
            Long userId,
            String providerFileId,
            String newName
    );

    ProviderFile createFolder(
            Long userId,
            String folderName
    );

    Long getTotalStorage(Long userId);

    Long getUsedStorage(Long userId);
}
