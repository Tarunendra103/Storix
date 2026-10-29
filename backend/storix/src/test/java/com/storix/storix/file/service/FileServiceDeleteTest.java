package com.storix.storix.file.service;

import com.storix.storix.account.entity.ConnectedAccount;
import com.storix.storix.account.repository.ConnectedAccountRepository;
import com.storix.storix.common.Enums.StorageProvider;
import com.storix.storix.file.entity.File;
import com.storix.storix.file.exception.CloudProviderException;
import com.storix.storix.file.exception.ResourceNotFoundException;
import com.storix.storix.file.provider.google.GoogleDriveProvider;
import com.storix.storix.file.repository.FileRepository;
import com.storix.storix.user.entity.User;
import com.storix.storix.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FileServiceDeleteTest {
    @Mock private FileRepository fileRepository;
    @Mock private UserRepository userRepository;
    @Mock private GoogleDriveProvider googleDriveProvider;
    @Mock private ConnectedAccountRepository connectedAccountRepository;
    @InjectMocks private FileService fileService;

    @Test
    void deletesDriveFileBeforeRemovingOwnedMetadataAndRefreshesQuota() {
        File file = ownedFile(7L, 11L, "drive-file");
        when(fileRepository.findByIdAndUserId(99L, 7L)).thenReturn(Optional.of(file));

        fileService.deleteFile(99L, 7L);

        InOrder inOrder = inOrder(googleDriveProvider, fileRepository);
        inOrder.verify(googleDriveProvider).deleteFile(11L, "drive-file");
        inOrder.verify(fileRepository).delete(file);
        verify(googleDriveProvider).refreshStorageQuota(file.getConnectedAccount());
    }

    @Test
    void preservesMetadataWhenDriveDeletionFails() {
        File file = ownedFile(7L, 11L, "drive-file");
        when(fileRepository.findByIdAndUserId(99L, 7L)).thenReturn(Optional.of(file));
        doThrow(new CloudProviderException(HttpStatus.FORBIDDEN, "Drive denied access", null))
                .when(googleDriveProvider).deleteFile(11L, "drive-file");

        assertThrows(CloudProviderException.class, () -> fileService.deleteFile(99L, 7L));

        verify(fileRepository, never()).delete(file);
        verify(googleDriveProvider, never()).refreshStorageQuota(file.getConnectedAccount());
    }

    @Test
    void doesNotCallProviderForAFileOutsideTheAuthenticatedUserScope() {
        when(fileRepository.findByIdAndUserId(99L, 7L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> fileService.deleteFile(99L, 7L));

        verify(googleDriveProvider, never()).deleteFile(org.mockito.ArgumentMatchers.anyLong(), org.mockito.ArgumentMatchers.anyString());
    }

    @Test
    void verifiesContentAccessOnlyAfterTheOwnedFileLookup() {
        File file = ownedFile(7L, 11L, "drive-file");
        when(fileRepository.findByIdAndUserId(99L, 7L)).thenReturn(Optional.of(file));

        fileService.verifyFileContentAccess(99L, 7L);

        verify(googleDriveProvider).verifyContentAccess(11L, "drive-file");
    }

    private File ownedFile(Long userId, Long accountId, String providerFileId) {
        User user = User.builder().id(userId).build();
        ConnectedAccount account = ConnectedAccount.builder()
                .id(accountId).user(user).provider(StorageProvider.GOOGLE_DRIVE).build();
        return File.builder().id(99L).user(user).connectedAccount(account)
                .provider(StorageProvider.GOOGLE_DRIVE).providerFileId(providerFileId)
                .name("report.pdf").mimeType("application/pdf").build();
    }
}
