package com.storix.storix.file.provider;

import com.storix.storix.account.entity.ConnectedAccount;
import com.storix.storix.file.dto.ProviderFile;

import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;

public interface CloudStorageProvider {
//    List<ProviderFile> listFiles(Long userId);
    List<ProviderFile> listFiles(ConnectedAccount account);

    void downloadFile(Long connectedAccountId, String providerFileId, OutputStream outputStream);

    void deleteFile(Long connectedAccountId, String providerFileId);

    ProviderFile renameFile(
            Long connectedAccountId,
            String providerFileId,
            String newName
    );

    ProviderFile uploadFile(
            Long connectedAccountId,
            String fileName,
            String mimeType,
            InputStream inputStream,
            String providerFolderId
    );
    List<ProviderFile> listFiles(
            Long connectedAccountId,
            String providerFolderId
    );

    ProviderFile createFolder(Long connectedAccountId, String folderName, String providerFolderId);
}
