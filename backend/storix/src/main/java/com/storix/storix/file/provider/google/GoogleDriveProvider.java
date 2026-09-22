package com.storix.storix.file.provider.google;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.InputStreamContent;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.api.services.drive.model.FileList;
import com.storix.storix.account.entity.ConnectedAccount;
import com.storix.storix.account.repository.ConnectedAccountRepository;
import com.storix.storix.common.Enums.StorageProvider;
import com.storix.storix.file.dto.ProviderFile;
import com.storix.storix.file.exception.ResourceNotFoundException;
import com.storix.storix.file.provider.CloudStorageProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoogleDriveProvider implements CloudStorageProvider {

    private final ConnectedAccountRepository connectedAccountRepository;

    private Drive createDriveClient(ConnectedAccount account) {

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
                                        == StorageProvider.GOOGLE_DRIVE)
                        .toList();

        List<ProviderFile> allFiles = new ArrayList<>();

        for (ConnectedAccount account : accounts) {

            Drive drive = createDriveClient(account);

            try {

                String pageToken = null;

                do {

                    FileList result = drive.files()
                            .list()
                            .setPageSize(100)
                            .setPageToken(pageToken)
                            .setQ("trashed = false")
                            .setFields(
                                    "nextPageToken," +
                                            "files(id,name,mimeType,size,parents," +
                                            "createdTime,modifiedTime)"
                            )
                            .execute();

                    for (File file : result.getFiles()) {

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

                    pageToken = result.getNextPageToken();

                } while (pageToken != null);

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
            Long connectedAccountId,
            String providerFileId
    ) {
        ConnectedAccount account =
                connectedAccountRepository.findById(connectedAccountId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Connected Google account not found"
                                )
                        );

        if (account.getProvider() != StorageProvider.GOOGLE_DRIVE) {
            throw new IllegalArgumentException(
                    "Connected account is not Google Drive"
            );
        }

        Drive drive = createDriveClient(account);

        try {
            java.io.ByteArrayOutputStream outputStream =
                    new java.io.ByteArrayOutputStream();

            drive.files()
                    .get(providerFileId)
                    .executeMediaAndDownloadTo(outputStream);

            return outputStream.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to download Google Drive file",
                    e
            );
        }
    }

    @Override
    public void deleteFile(
            Long connectedAccountId,
            String providerFileId
    ) {
        ConnectedAccount account =
                connectedAccountRepository.findById(connectedAccountId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Connected Google account not found"
                                )
                        );

        if (account.getProvider() != StorageProvider.GOOGLE_DRIVE) {
            throw new IllegalArgumentException(
                    "Connected account is not Google Drive"
            );
        }

        Drive drive = createDriveClient(account);

        try {
            drive.files()
                    .delete(providerFileId)
                    .execute();

        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to delete Google Drive file",
                    e
            );
        }
    }


    @Override
    public ProviderFile uploadFile(
            Long connectedAccountId,
            String fileName,
            String mimeType,
            InputStream inputStream
    ) {

        ConnectedAccount account =
                connectedAccountRepository.findById(connectedAccountId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Connected Google account not found"
                                )
                        );

        if (account.getProvider() != StorageProvider.GOOGLE_DRIVE) {
            throw new IllegalArgumentException(
                    "Connected account is not Google Drive"
            );
        }

        Drive drive = createDriveClient(account);

        try {

            File metadata = new File()
                    .setName(fileName);

            InputStreamContent mediaContent =
                    new InputStreamContent(
                            mimeType != null
                                    ? mimeType
                                    : "application/octet-stream",
                            inputStream
                    );

            File uploadedFile = drive.files()
                    .create(metadata, mediaContent)
                    .setFields(
                            "id,name,mimeType,size,parents"
                    )
                    .execute();

            return ProviderFile.builder()
                    .providerFileId(uploadedFile.getId())
                    .name(uploadedFile.getName())
                    .mimeType(uploadedFile.getMimeType())
                    .size(uploadedFile.getSize())
                    .category(
                            determineCategory(
                                    uploadedFile.getMimeType()
                            )
                    )
                    .providerFolderId(
                            uploadedFile.getParents() != null
                                    ? uploadedFile.getParents().get(0)
                                    : null
                    )
                    .connectedAccountId(account.getId())
                    .build();

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to upload file to Google Drive",
                    e
            );
        }
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
    public List<String> getExistingFileIds(
            ConnectedAccount account
    ) {

        Drive drive = createDriveClient(account);

        List<String> fileIds = new ArrayList<>();

        try {

            String pageToken = null;

            do {

                FileList result = drive.files()
                        .list()
                        .setPageSize(100)
                        .setPageToken(pageToken)
                        .setQ("trashed = false")
                        .setFields("nextPageToken,files(id)")
                        .execute();

                fileIds.addAll(
                        result.getFiles()
                                .stream()
                                .map(File::getId)
                                .toList()
                );

                pageToken = result.getNextPageToken();

            } while (pageToken != null);

            return fileIds;

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to fetch Google Drive file IDs",
                    e
            );
        }
    }


    @Override
    public List<ProviderFile> listFiles(
            Long connectedAccountId,
            String providerFolderId
    ) {

        ConnectedAccount account =
                connectedAccountRepository.findById(connectedAccountId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Connected Google account not found"
                                )
                        );

        if (account.getProvider() != StorageProvider.GOOGLE_DRIVE) {
            throw new IllegalArgumentException(
                    "Connected account is not Google Drive"
            );
        }

        Drive drive = createDriveClient(account);

        try {

            String query =
                    "'" + providerFolderId + "' in parents " +
                            "and trashed = false";

            FileList result = drive.files()
                    .list()
                    .setQ(query)
                    .setPageSize(100)
                    .setFields(
                            "files(id,name,mimeType,size,parents,createdTime,modifiedTime)"
                    )
                    .execute();

            return result.getFiles()
                    .stream()
                    .map(file -> ProviderFile.builder()
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
                    )
                    .toList();

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to fetch files from Google Drive folder",
                    e
            );
        }
    }
    }

