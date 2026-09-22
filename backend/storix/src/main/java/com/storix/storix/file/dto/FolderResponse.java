package com.storix.storix.file.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class FolderResponse {

    private Long id;

    private String name;

    private String providerFileId;

    private String providerFolderId;

    private Long connectedAccountId;
}
