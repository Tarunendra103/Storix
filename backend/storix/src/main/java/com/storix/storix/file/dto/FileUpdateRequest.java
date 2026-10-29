package com.storix.storix.file.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class FileUpdateRequest {
    private String name;
    private Long folderId;
    private Boolean favourite;
}
