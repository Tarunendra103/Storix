package com.storix.storix.file.provider.google;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.HttpTransport;
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
import com.storix.storix.file.service.FileCategory;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class GoogleDriveProvider implements CloudStorageProvider {

    private final Map<Long, Object> tokenRefreshLocks = new ConcurrentHashMap<>();
    private volatile HttpTransport httpTransport;

    @Value("${google.oauth.client-id}")
    private String clientId;

    @Value("${google.oauth.client-secret}")
    private String clientSecret;

    @Value("${google.oauth.token-uri}")
    private String tokenUri;

    private final RestClient restClient = RestClient.create();

    private final ConnectedAccountRepository connectedAccountRepository;
    private static final Logger logger = LoggerFactory.getLogger(GoogleDriveProvider.class);

    private Drive createDriveClient(ConnectedAccount account) {
        refreshAccessTokenIfNeeded(account);
        try {
            HttpRequestInitializer requestInitializer = request -> {
                request.getHeaders().setAuthorization("Bearer " + account.getAccessToken());
                request.setConnectTimeout(10_000);
                request.setReadTimeout(60_000);
            };

            return new Drive.Builder(
                    getHttpTransport(),
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

    /** Reuse the trusted transport instead of rebuilding TLS configuration per Drive call. */
    private HttpTransport getHttpTransport() throws GeneralSecurityException, IOException {
        HttpTransport current = httpTransport;
        if (current != null) {
            return current;
        }
        synchronized (this) {
            if (httpTransport == null) {
                httpTransport = GoogleNetHttpTransport.newTrustedTransport();
            }
            return httpTransport;
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
                        .setSpaces("drive")
                        .setCorpora("user")
                        .setIncludeItemsFromAllDrives(true)
                        .setSupportsAllDrives(true)
                        // The user corpus also includes files shared with the
                        // account. Storix is a personal catalog, so only sync
                        // Drive items actually owned by this connected account.
                        .setQ("'me' in owners and trashed = false")
                        .setFields(
                                "nextPageToken," +
                                        "files(id,name,mimeType,size,parents," +
                                        "createdTime,modifiedTime)"
                        )
                        .execute();

                List<File> pageFiles = result.getFiles();
                if (pageFiles == null) {
                    pageFiles = List.of();
                }
                for (File file : pageFiles) {

                    files.add(
                            ProviderFile.builder()
                                    .providerFileId(file.getId())
                                    .name(file.getName())
                                    .mimeType(file.getMimeType())
                                    .size(file.getSize())
                                    .category(
                                            FileCategory.classify(
                                                    file.getMimeType(),
                                                    file.getName()
                                            )
                                    )
                                    .providerFolderId(
                                            file.getParents() != null && !file.getParents().isEmpty()
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
    @Override
    public void downloadFile(
            Long connectedAccountId,
            String providerFileId,
            OutputStream outputStream
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
            logger.error("Failed to fetch Google Drive files for accountId: {}", account.getId(), e);
            throw new RuntimeException(
                    "Failed to fetch Google Drive files",
                    e
            );
        }
    }


    @Override
    public ProviderFile uploadFile(
            Long connectedAccountId,
            String fileName,
            String mimeType,
            InputStream inputStream,
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

            File metadata = new File()
                    .setName(fileName);
            if (providerFolderId != null && !providerFolderId.isBlank()) {
                metadata.setParents(List.of(providerFolderId));
            }

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
                            FileCategory.classify(
                                    uploadedFile.getMimeType(),
                                    uploadedFile.getName()
                            )
                    )
                    .providerFolderId(
                            uploadedFile.getParents() != null && !uploadedFile.getParents().isEmpty()
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
            Long connectedAccountId,
            String providerFileId,
            String newName
    ) {
        ConnectedAccount account = requireGoogleAccount(connectedAccountId);
        try {
            File updated = createDriveClient(account).files()
                    .update(providerFileId, new File().setName(newName))
                    .setFields("id,name,mimeType,size,parents")
                    .execute();
            return toProviderFile(updated, account.getId());
        } catch (IOException e) {
            throw new RuntimeException("Failed to rename Google Drive file", e);
        }
    }

    @Override
    public ProviderFile createFolder(Long connectedAccountId, String folderName, String providerFolderId) {
        ConnectedAccount account = requireGoogleAccount(connectedAccountId);
        File metadata = new File()
                .setName(folderName)
                .setMimeType("application/vnd.google-apps.folder");
        if (providerFolderId != null && !providerFolderId.isBlank()) {
            metadata.setParents(List.of(providerFolderId));
        }
        try {
            File created = createDriveClient(account).files()
                    .create(metadata)
                    .setFields("id,name,mimeType,size,parents")
                    .execute();
            return toProviderFile(created, account.getId());
        } catch (IOException e) {
            throw new RuntimeException("Failed to create Google Drive folder", e);
        }
    }

    @Override
    public List<ProviderFile> listFiles(
            Long connectedAccountId,
            String providerFolderId
    ) {
        ConnectedAccount account = requireGoogleAccount(connectedAccountId);

        Drive drive = createDriveClient(account);

        try {

            String query;

            if (providerFolderId == null) {

                String rootId = getRootFolderId(account);

                query =
                        "'" + rootId + "' in parents " +
                                "and 'me' in owners and trashed = false";

            } else {

                query =
                        "'" + providerFolderId + "' in parents " +
                                "and 'me' in owners and trashed = false";
            }

            List<ProviderFile> resultFiles = new ArrayList<>();
            String pageToken = null;
            do {
                FileList result = drive.files().list()
                        .setQ(query).setPageSize(100).setPageToken(pageToken)
                        .setSpaces("drive").setCorpora("user")
                        .setIncludeItemsFromAllDrives(true).setSupportsAllDrives(true)
                        .setFields("nextPageToken,files(id,name,mimeType,size,parents,createdTime,modifiedTime)")
                        .execute();
                if (result.getFiles() != null) {
                    resultFiles.addAll(result.getFiles().stream()
                            .map(file -> toProviderFile(file, account.getId())).toList());
                }
                pageToken = result.getNextPageToken();
            } while (pageToken != null);
            return resultFiles;

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

    private ConnectedAccount requireGoogleAccount(Long connectedAccountId) {
        ConnectedAccount account = connectedAccountRepository.findById(connectedAccountId)
                .orElseThrow(() -> new ResourceNotFoundException("Connected Google account not found"));
        if (account.getProvider() != StorageProvider.GOOGLE_DRIVE) {
            throw new IllegalArgumentException("Connected account is not Google Drive");
        }
        return account;
    }

    private ProviderFile toProviderFile(File file, Long connectedAccountId) {
        return ProviderFile.builder()
                .providerFileId(file.getId()).name(file.getName()).mimeType(file.getMimeType())
                .size(file.getSize()).category(FileCategory.classify(file.getMimeType(), file.getName()))
                .providerFolderId(file.getParents() != null && !file.getParents().isEmpty() ? file.getParents().get(0) : null)
                .connectedAccountId(connectedAccountId).build();
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
        Object lock = tokenRefreshLocks.computeIfAbsent(account.getId(), unused -> new Object());
        synchronized (lock) {
            ConnectedAccount currentAccount = connectedAccountRepository.findById(account.getId()).orElse(account);
            if (currentAccount.getExpiresAt() != null && currentAccount.getExpiresAt().isAfter(LocalDateTime.now().plusMinutes(1))) {
                account.setAccessToken(currentAccount.getAccessToken());
                account.setExpiresAt(currentAccount.getExpiresAt());
                return;
            }

        String refreshToken = currentAccount.getRefreshToken();

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

        currentAccount.setAccessToken(
                (String) response.get("access_token")
        );

        Number expiresIn = (Number) response.get("expires_in");

        if (expiresIn != null) {
            currentAccount.setExpiresAt(
                    LocalDateTime.now()
                            .plusSeconds(expiresIn.longValue())
            );
        }

        currentAccount.setUpdatedAt(LocalDateTime.now());
        ConnectedAccount saved = connectedAccountRepository.save(currentAccount);
        account.setAccessToken(saved.getAccessToken());
        account.setExpiresAt(saved.getExpiresAt());
        }
    }

    }



