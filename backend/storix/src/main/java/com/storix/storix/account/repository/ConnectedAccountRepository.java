package com.storix.storix.account.repository;

import com.storix.storix.account.entity.ConnectedAccount;
import com.storix.storix.common.Enums.StorageProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConnectedAccountRepository extends JpaRepository<ConnectedAccount,Long> {
    List<ConnectedAccount> findAllByUserId(Long userId);

    Optional<ConnectedAccount> findByIdAndUserId(
            Long id,
            Long userId
    );

    boolean existsByUserIdAndProviderAndAccountEmail(
            Long userId,
            StorageProvider provider,
            String accountEmail
    );

    Optional<ConnectedAccount>
    findByUserIdAndProviderAndAccountEmail(
            Long userId,
            StorageProvider provider,
            String accountEmail
    );

}
