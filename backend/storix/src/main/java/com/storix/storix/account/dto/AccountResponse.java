package com.storix.storix.account.dto;

import com.storix.storix.common.Enums.StorageProvider;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AccountResponse {
    private Long id;
    private StorageProvider provider;
    private String accountEmail;
    private Long totalStorage;
    private Long usedStorage;
}
