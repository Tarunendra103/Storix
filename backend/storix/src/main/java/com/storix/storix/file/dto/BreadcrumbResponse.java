package com.storix.storix.file.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BreadcrumbResponse {

    private String name;

    private String providerFolderId;
}