package com.storix.storix.file.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class FileUpdateRequest {
    @NotBlank
    private String name;
    private Long folderId;
    private boolean favourite;
}
