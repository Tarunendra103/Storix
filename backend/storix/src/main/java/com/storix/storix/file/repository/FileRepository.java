package com.storix.storix.file.repository;

import com.storix.storix.file.entity.File;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FileRepository extends JpaRepository<File,Long> {
    @EntityGraph(attributePaths = "connectedAccount")
    List<File> findAllByUserId(Long userId);

    @EntityGraph(attributePaths = "connectedAccount")
    Optional<File> findByIdAndUserId(Long id, Long userId);

    Optional<File> findByUserIdAndConnectedAccountIdAndProviderFileId(
            Long userId,
            Long connectedAccountId,
            String providerFileId
    );
    @EntityGraph(attributePaths = "connectedAccount")
    List<File> findAllByUserIdAndConnectedAccountId(
            Long userId,
            Long connectedAccountId
    );

    List<File> findAllByUserIdAndNameContainingIgnoreCase(
            Long userId,
            String name
    );
    List<File> findAllByUserIdAndConnectedAccountIdAndProviderFolderId(
            Long userId,
            Long connectedAccountId,
            String providerFolderId
    );
    List<File> findAllByUserIdAndConnectedAccountIdAndCategory(
            Long userId,
            Long connectedAccountId,
            String category
    );

    void deleteAllByUserIdAndConnectedAccountId(Long userId, Long connectedAccountId);

}
