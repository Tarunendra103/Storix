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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.io.InputStream;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GoogleDriveProvider implements CloudStorageProvider {

    @Value("${google.oauth.client-id}")
    private String clientId;

    @Value("${google.oauth.client-secret}")
    private String clientSecret;

    @Value("${google.oauth.token-uri}")
    private String tokenUri;

    private final RestClient restClient = RestClient.create();

    private final ConnectedAccountRepository connectedAccountRepository;

    private Drive createDriveClient(ConnectedAccount account) {
        refreshAccessTokenIfNeeded(account);
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
    public List<ProviderFile> listFiles(ConnectedAccount account) {

        Drive drive = createDriveClient(account);

        List<ProviderFile> files = new ArrayList<>();

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

                    files.add(
                            ProviderFile.builder()
                                    .providerFileId(file.getId())
                                    .name(file.getName())
                                    .mimeType(file.getMimeType())
                                    .size(file.getSize())
                                    .category(
                                            determineCategory(
                                                    file.getMimeType(),
                                                    file.getName()
                                            )
                                    )
                                    .providerFolderId(
                                            file.getParents() != null
                                                    ? file.getParents().get(0)
                                                    : null
                                    )
                                    .connectedAccountId(
                                            account.getId()
                                    )
                                    .build()
                    );
                }

                pageToken = result.getNextPageToken();

            } while (pageToken != null);

            return files;

        } catch (IOException e) {

            throw new RuntimeException(
                    "Failed to fetch Google Drive files",
                    e
            );
        }
    }
    private String determineCategory(String mimeType, String name) {

        if (mimeType != null && mimeType.equals("application/vnd.google-apps.folder")) {
            return "FOLDERS";
        }

        if (mimeType != null) {
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
                    || mimeType.contains("presentation")
                    || mimeType.contains("msword")
                    || mimeType.contains("excel")
                    || mimeType.contains("powerpoint")
                    || mimeType.contains("opendocument")) {
                return "DOCUMENTS";
            }
        }

        // Check file extension if MIME type is generic or missing
        if (name != null && name.contains(".")) {
            String ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase();
            if (ext.matches("jpg|jpeg|png|gif|webp|svg|bmp|tiff|heic")) {
                return "PHOTOS";
            }
            if (ext.matches("mp4|mov|avi|mkv|webm|wmv|flv|m4v")) {
                return "VIDEOS";
            }
            if (ext.matches("pdf|doc|docx|xls|xlsx|ppt|pptx|txt|rtf|csv|md|odt|ods|odp")) {
                return "DOCUMENTS";
            }
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

            File metadata = drive.files().get(providerFileId)
                    .setFields("id, name, mimeType")
                    .execute();

            String mimeType = metadata.getMimeType();

            if (mimeType != null && mimeType.startsWith("application/vnd.google-apps.")) {
                String exportMimeType = "application/pdf";
                if (mimeType.contains("spreadsheet")) {
                    exportMimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                } else if (mimeType.contains("presentation")) {
                    exportMimeType = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
                } else if (mimeType.contains("document")) {
                    exportMimeType = "application/pdf";
                }

                drive.files()
                        .export(providerFileId, exportMimeType)
                        .executeMediaAndDownloadTo(outputStream);
            } else {
                drive.files()
                        .get(providerFileId)
                        .executeMediaAndDownloadTo(outputStream);
            }

            return outputStream.toByteArray();

        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to download Google Drive file: " + e.getMessage(),
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
                                    uploadedFile.getMimeType(),
                                    uploadedFile.getName()
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
        return 0L;
    }

    @Override
    public Long getUsedStorage(Long userId) {
        return 0L;
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

            String query;

            if (providerFolderId == null) {

                String rootId = getRootFolderId(account);

                query =
                        "'" + rootId + "' in parents " +
                                "and trashed = false";

            } else {

                query =
                        "'" + providerFolderId + "' in parents " +
                                "and trashed = false";
            }

            FileList result = drive.files()
                    .list()
                    .setQ(query)
                    .setPageSize(100)
                    .setFields(
                            "files(id,name,mimeType,size,parents,createdTime,modifiedTime)"
                    )
                    .execute();

            List<com.google.api.services.drive.model.File> driveFiles = result.getFiles();
            if (driveFiles == null) {
                return new ArrayList<>();
            }

            return driveFiles
                    .stream()
                    .map((com.google.api.services.drive.model.File file) -> ProviderFile.builder()
                            .providerFileId(file.getId())
                            .name(file.getName())
                            .mimeType(file.getMimeType())
                            .size(file.getSize())
                            .category(
                                    determineCategory(
                                            file.getMimeType(),
                                            file.getName()
                                    )
                            )
                            .providerFolderId(
                                    file.getParents() != null && !file.getParents().isEmpty()
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

    private String getRootFolderId(ConnectedAccount account) {

        Drive drive = createDriveClient(account);

        try {
            return drive.files()
                    .get("root")
                    .setFields("id")
                    .execute()
                    .getId();

        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to get Google Drive root folder",
                    e
            );
        }
    }
    public String getRootFolderIdForAccount(
            Long connectedAccountId
    ) {

        ConnectedAccount account =
                connectedAccountRepository
                        .findById(connectedAccountId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Connected Google account not found"
                                )
                        );

        return getRootFolderId(account);
    }

    public void refreshStorageQuota(ConnectedAccount account) {

        Drive drive = createDriveClient(account);

        try {
            com.google.api.services.drive.model.About about =
                    drive.about()
                            .get()
                            .setFields("storageQuota(limit,usage,usageInDrive)")
                            .execute();

            com.google.api.services.drive.model.About.StorageQuota quota =
                    about.getStorageQuota();

            if (quota == null) {
                account.setTotalStorage(null);
                account.setUsedStorage(null);
            } else {
                account.setTotalStorage(quota.getLimit());

                // Storage used by files in Google Drive, in bytes.
                account.setUsedStorage(quota.getUsage());
            }

            account.setUpdatedAt(java.time.LocalDateTime.now());

            connectedAccountRepository.save(account);

        } catch (IOException e) {
            throw new RuntimeException(
                    "Failed to fetch Google Drive storage quota",
                    e
            );
        }
    }


    private void refreshAccessTokenIfNeeded(ConnectedAccount account) {

        // Refresh shortly before expiration.
        if (account.getExpiresAt() != null
                && account.getExpiresAt().isAfter(
                LocalDateTime.now().plusMinutes(1))) {
            return;
        }

        String refreshToken = account.getRefreshToken();

        if (refreshToken == null || refreshToken.isBlank()) {
            throw new IllegalStateException(
                    "Google access token expired and no refresh token exists. "
                            + "Reconnect the Google account."
            );
        }

        MultiValueMap<String, String> formData =
                new LinkedMultiValueMap<>();

        formData.add("client_id", clientId);
        formData.add("client_secret", clientSecret);
        formData.add("refresh_token", refreshToken);
        formData.add("grant_type", "refresh_token");

        Map<String, Object> response = restClient
                .post()
                .uri(tokenUri)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(formData)
                .retrieve()
                .body(Map.class);

        if (response == null || response.get("access_token") == null) {
            throw new IllegalStateException(
                    "Google did not return a refreshed access token."
            );
        }

        account.setAccessToken(
                (String) response.get("access_token")
        );

        Number expiresIn = (Number) response.get("expires_in");

        if (expiresIn != null) {
            account.setExpiresAt(
                    LocalDateTime.now()
                            .plusSeconds(expiresIn.longValue())
            );
        }

        account.setUpdatedAt(LocalDateTime.now());

        connectedAccountRepository.save(account);
    }

    }



