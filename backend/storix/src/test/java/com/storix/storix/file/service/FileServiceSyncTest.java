package com.storix.storix.file.service;

import com.storix.storix.account.entity.ConnectedAccount;
import com.storix.storix.account.repository.ConnectedAccountRepository;
import com.storix.storix.common.Enums.StorageProvider;
import com.storix.storix.file.dto.ProviderFile;
import com.storix.storix.file.dto.SyncResponse;
import com.storix.storix.file.entity.File;
import com.storix.storix.file.exception.ResourceNotFoundException;
import com.storix.storix.file.provider.google.GoogleDriveProvider;
import com.storix.storix.file.repository.FileRepository;
import com.storix.storix.user.entity.User;
import com.storix.storix.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FileServiceSyncTest {

    @Mock private FileRepository fileRepository;
    @Mock private UserRepository userRepository;
    @Mock private GoogleDriveProvider googleDriveProvider;
    @Mock private ConnectedAccountRepository connectedAccountRepository;
    @InjectMocks private FileService fileService;

    @Test
    void syncUpdatesExistingMetadataAndRemovesOnlyFilesAbsentFromCompletedListing() {
        User user = User.builder().id(7L).build();
        ConnectedAccount account = ConnectedAccount.builder()
                .id(11L).user(user).provider(StorageProvider.GOOGLE_DRIVE).build();
        File current = File.builder().id(101L).user(user).connectedAccount(account)
                .providerFileId("current").name("old name").mimeType("text/plain")
                .category(FileCategory.OTHER).size(3L).build();
        File stale = File.builder().id(102L).user(user).connectedAccount(account)
                .providerFileId("stale").name("removed").build();
        ProviderFile fromDrive = ProviderFile.builder().connectedAccountId(11L)
                .providerFileId("current").name("report.pdf").mimeType("application/pdf")
                .category(FileCategory.DOCUMENTS).size(42L).providerFolderId("folder-1").build();

        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(connectedAccountRepository.findAllByUserId(7L)).thenReturn(List.of(account));
        when(googleDriveProvider.listFiles(account)).thenReturn(List.of(fromDrive));
        when(fileRepository.findAllByUserIdAndConnectedAccountId(7L, 11L))
                .thenReturn(List.of(current, stale));

        fileService.syncGoogleDriveFiles(7L);

        assertEquals("report.pdf", current.getName());
        assertEquals("application/pdf", current.getMimeType());
        assertEquals(FileCategory.DOCUMENTS, current.getCategory());
        assertEquals(42L, current.getSize());
        assertEquals("folder-1", current.getProviderFolderId());
        verify(fileRepository).saveAll(List.of(current));
        verify(fileRepository).deleteAll(List.of(stale));
        verify(googleDriveProvider).refreshStorageQuota(account);
    }

    @Test
    void failedProviderListingDoesNotReconcileOrDeleteStoredMetadata() {
        User user = User.builder().id(7L).build();
        ConnectedAccount account = ConnectedAccount.builder()
                .id(11L).user(user).provider(StorageProvider.GOOGLE_DRIVE).build();
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(connectedAccountRepository.findAllByUserId(7L)).thenReturn(List.of(account));
        when(googleDriveProvider.listFiles(account)).thenThrow(new RuntimeException("Drive unavailable"));

        SyncResponse result = fileService.syncGoogleDriveFiles(7L);

        assertEquals(0, result.syncedAccounts());
        assertEquals(1, result.failedAccounts());
        verify(fileRepository, never()).findAllByUserIdAndConnectedAccountId(7L, 11L);
        verify(fileRepository, never()).deleteAll(org.mockito.ArgumentMatchers.<Iterable<File>>any());
    }

    @Test
    void quotaFailureDoesNotDiscardCompletedFileSync() {
        User user = User.builder().id(7L).build();
        ConnectedAccount account = ConnectedAccount.builder()
                .id(11L).user(user).provider(StorageProvider.GOOGLE_DRIVE).build();
        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(connectedAccountRepository.findAllByUserId(7L)).thenReturn(List.of(account));
        when(googleDriveProvider.listFiles(account)).thenReturn(List.of());
        when(fileRepository.findAllByUserIdAndConnectedAccountId(7L, 11L)).thenReturn(List.of());
        org.mockito.Mockito.doThrow(new RuntimeException("quota unavailable"))
                .when(googleDriveProvider).refreshStorageQuota(account);

        fileService.syncGoogleDriveFiles(7L);

        verify(fileRepository).findAllByUserIdAndConnectedAccountId(7L, 11L);
    }

    @Test
    void syncsEachConnectedAccountIndependentlyWithoutPerFileDatabaseLookups() {
        User user = User.builder().id(7L).build();
        ConnectedAccount firstAccount = ConnectedAccount.builder()
                .id(11L).user(user).provider(StorageProvider.GOOGLE_DRIVE).build();
        ConnectedAccount secondAccount = ConnectedAccount.builder()
                .id(12L).user(user).provider(StorageProvider.GOOGLE_DRIVE).build();
        ProviderFile firstFile = ProviderFile.builder().connectedAccountId(11L).providerFileId("same-drive-id")
                .name("first.jpg").mimeType("image/jpeg").category(FileCategory.PHOTOS).size(10L).build();
        ProviderFile secondFile = ProviderFile.builder().connectedAccountId(12L).providerFileId("same-drive-id")
                .name("second.mp4").mimeType("video/mp4").category(FileCategory.VIDEOS).size(20L).build();

        when(userRepository.findById(7L)).thenReturn(Optional.of(user));
        when(connectedAccountRepository.findAllByUserId(7L)).thenReturn(List.of(firstAccount, secondAccount));
        when(googleDriveProvider.listFiles(firstAccount)).thenReturn(List.of(firstFile));
        when(googleDriveProvider.listFiles(secondAccount)).thenReturn(List.of(secondFile));
        when(fileRepository.findAllByUserIdAndConnectedAccountId(7L, 11L)).thenReturn(List.of());
        when(fileRepository.findAllByUserIdAndConnectedAccountId(7L, 12L)).thenReturn(List.of());

        fileService.syncGoogleDriveFiles(7L);

        verify(fileRepository, times(2)).saveAll(org.mockito.ArgumentMatchers.<Iterable<File>>any());
        verify(fileRepository, never()).findByUserIdAndConnectedAccountIdAndProviderFileId(
                org.mockito.ArgumentMatchers.anyLong(), org.mockito.ArgumentMatchers.anyLong(), org.mockito.ArgumentMatchers.anyString());
        verify(googleDriveProvider).refreshStorageQuota(firstAccount);
        verify(googleDriveProvider).refreshStorageQuota(secondAccount);
    }

    @Test
    void fileLookupCannotBypassTheAuthenticatedUserScope() {
        when(fileRepository.findByIdAndUserId(99L, 7L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> fileService.getFileById(99L, 7L));

        verifyNoInteractions(googleDriveProvider);
    }
}
