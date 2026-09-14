package com.storix.storix.account.service;

import com.storix.storix.account.dto.AccountResponse;
import com.storix.storix.account.entity.ConnectedAccount;
import com.storix.storix.account.repository.ConnectedAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AccountService {
    private final ConnectedAccountRepository connectedAccountRepository;

    public List<AccountResponse> getConnectedAccounts(Long userId){
        return connectedAccountRepository.findAllByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
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
