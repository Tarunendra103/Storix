package com.storix.storix.file.dto;

import com.storix.storix.file.entity.StorageProvider;
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

}
