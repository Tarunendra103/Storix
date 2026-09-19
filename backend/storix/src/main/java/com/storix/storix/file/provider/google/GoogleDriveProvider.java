package com.storix.storix.file.provider.google;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.FileList;
import com.storix.storix.account.entity.ConnectedAccount;
import com.storix.storix.account.repository.ConnectedAccountRepository;
import com.storix.storix.common.Enums.StorageProvider;
import com.storix.storix.file.dto.ProviderFile;
import com.storix.storix.file.provider.CloudStorageProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoogleDriveProvider implements CloudStorageProvider {

    private final ConnectedAccountRepository connectedAccountRepository;

    private Drive createDriveClient(Long userId) {

        ConnectedAccount account =
                connectedAccountRepository
                        .findAllByUserId(userId)
                        .stream()
                        .filter(a ->
                                a.getProvider() ==
                                        StorageProvider.GOOGLE_DRIVE
                        )
                        .findFirst()
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Google Drive account not connected"
                                )
                        );

        try {
            HttpRequestInitializer requestInitializer =
                    request -> request.getHeaders()
                            .setAuthorization(
                                    "Bearer " + account.getAccessToken()
                            );

            return new Drive.Builder(
                    GoogleNetHttpTransport.newTrustedTransport(),
                    GsonFactory.getDefaultInstance(),
                    requestInitializer
            )
                    .setApplicationName("Storix")
                    .build();

        } catch (GeneralSecurityException | IOException e) {
            throw new RuntimeException(
                    "Failed to create Google Drive client",
                    e
            );
        }
    }

    @Override
    public List<ProviderFile> listFiles(Long userId) {

        List<ConnectedAccount> accounts =
                connectedAccountRepository.findAllByUserId(userId)
                        .stream()
                        .filter(account ->
                                account.getProvider()
                                        == StorageProvider.GOOGLE_DRIVE
                        )
                        .toList();

        List<ProviderFile> allFiles = new ArrayList<>();

        for (ConnectedAccount account : accounts) {

            Drive drive = createDriveClient(account);

            try {
                FileList result = drive.files()
                        .list()
                        .setPageSize(100)
                        .setFields(
                                "files(id,name,mimeType,size,parents,"
                                        + "createdTime,modifiedTime)"
                        )
                        .execute();

                for (com.google.api.services.drive.model.File file
                        : result.getFiles()) {

                    allFiles.add(
                            ProviderFile.builder()
                                    .providerFileId(file.getId())
                                    .name(file.getName())
                                    .mimeType(file.getMimeType())
                                    .size(file.getSize())
                                    .category(
                                            determineCategory(
                                                    file.getMimeType()
                                            )
                                    )
                                    .providerFolderId(
                                            file.getParents() != null
                                                    ? file.getParents().get(0)
                                                    : null
                                    )
                                    .connectedAccountId(account.getId())
                                    .build()
                    );
                }

            } catch (IOException e) {
                throw new RuntimeException(
                        "Failed to fetch Google Drive files",
                        e
                );
            }
        }

        return allFiles;
    }

    private String determineCategory(String mimeType) {

        if (mimeType == null) {
            return "OTHER";
        }

        if (mimeType.startsWith("image/")) {
            return "PHOTOS";
        }

        if (mimeType.startsWith("video/")) {
            return "VIDEOS";
        }

        if (mimeType.startsWith("text/")
                || mimeType.contains("pdf")
                || mimeType.contains("document")
                || mimeType.contains("spreadsheet")
                || mimeType.contains("presentation")) {
            return "DOCUMENTS";
        }

        if (mimeType.equals(
                "application/vnd.google-apps.folder")) {
            return "FOLDERS";
        }

        return "OTHER";
    }

    @Override
    public ProviderFile getFile(
            Long userId,
            String providerFileId
    ) {
        throw new UnsupportedOperationException(
                "Get file not implemented yet"
        );
    }

    @Override
    public byte[] downloadFile(
            Long userId,
            String providerFileId
    ) {
        throw new UnsupportedOperationException(
                "Download not implemented yet"
        );
    }

    @Override
    public void deleteFile(
            Long userId,
            String providerFileId
    ) {
        throw new UnsupportedOperationException(
                "Delete not implemented yet"
        );
    }

    @Override
    public ProviderFile renameFile(
            Long userId,
            String providerFileId,
            String newName
    ) {
        throw new UnsupportedOperationException(
                "Rename not implemented yet"
        );
    }

    @Override
    public ProviderFile createFolder(
            Long userId,
            String folderName
    ) {
        throw new UnsupportedOperationException(
                "Create folder not implemented yet"
        );
    }

    @Override
    public Long getTotalStorage(Long userId) {
        throw new UnsupportedOperationException(
                "Storage information not implemented yet"
        );
    }

    @Override
    public Long getUsedStorage(Long userId) {
        throw new UnsupportedOperationException(
                "Storage information not implemented yet"
        );
    }
}
