package com.storix.storix.file.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ProviderFile {
    private String providerFileId;
    private String name;
    private String mimeType;
    private Long size;
    private String category;
    private String providerFolderId;
    private Long connectedAccountId;
}
