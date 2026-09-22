package com.storix.storix.file.dto;

import com.storix.storix.common.Enums.StorageProvider;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class FileResponse {
    private Long id;
    private String name;
    private String mimeType;
    private String category;
    private Long size;
    private StorageProvider provider;
    private String providerFileId;
    private Long folderId;
    private boolean favorite;
    private Long connectedAccountId;
    private String accountEmail;
    private String providerFolderId;

}
