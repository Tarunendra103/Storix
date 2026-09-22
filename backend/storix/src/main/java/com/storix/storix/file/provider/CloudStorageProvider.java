package com.storix.storix.file.provider;

import com.storix.storix.account.entity.ConnectedAccount;
import com.storix.storix.file.dto.ProviderFile;
import com.storix.storix.file.entity.File;

import java.io.InputStream;
import java.util.List;

public interface CloudStorageProvider {
//    List<ProviderFile> listFiles(Long userId);
    List<ProviderFile> listFiles(ConnectedAccount account);

    ProviderFile getFile(Long userId, String providerFileId);

    byte[] downloadFile( Long connectedAccountId,
                         String providerFileId);

    void deleteFile(Long connectedAccountId, String providerFileId);

    ProviderFile renameFile(
            Long userId,
            String providerFileId,
            String newName
    );

    ProviderFile uploadFile(
            Long connectedAccountId,
            String fileName,
            String mimeType,
            InputStream inputStream
    );
    List<ProviderFile> listFiles(
            Long connectedAccountId,
            String providerFolderId
    );

    ProviderFile createFolder(
            Long userId,
            String folderName
    );

    Long getTotalStorage(Long userId);

    Long getUsedStorage(Long userId);
}
