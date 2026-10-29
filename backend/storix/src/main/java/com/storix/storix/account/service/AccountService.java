package com.storix.storix.account.service;

import com.storix.storix.account.dto.AccountResponse;
import com.storix.storix.account.entity.ConnectedAccount;
import com.storix.storix.account.repository.ConnectedAccountRepository;
import com.storix.storix.file.exception.ResourceNotFoundException;
import com.storix.storix.file.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {
    private final ConnectedAccountRepository connectedAccountRepository;
    private final FileRepository fileRepository;

    public List<AccountResponse> getConnectedAccounts(Long userId){
        return connectedAccountRepository.findAllByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }
    /** Removes Storix metadata and credentials only; it never deletes cloud files. */
    @Transactional
    public void disconnect(Long userId, Long accountId) {
        ConnectedAccount account = connectedAccountRepository.findByIdAndUserId(accountId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Connected account not found"));
        fileRepository.deleteAllByUserIdAndConnectedAccountId(userId, account.getId());
        connectedAccountRepository.delete(account);
    }
    private AccountResponse mapToResponse(ConnectedAccount account){
        return new AccountResponse(
                account.getId(),
                account.getProvider(),
                account.getAccountEmail(),
                account.getTotalStorage(),
                account.getUsedStorage()
        );
    }
}
