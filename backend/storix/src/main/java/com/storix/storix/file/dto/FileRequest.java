package com.storix.storix.file.dto;

import com.storix.storix.file.entity.StorageProvider;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter

@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String mimeType;
    @NotBlank
    private String category;
    @NotNull
    private Long size;
    @NotNull
    private StorageProvider provider;
    @NotBlank
    private String providerFileId;

    private Long folderId;
    private boolean favorite;
}
