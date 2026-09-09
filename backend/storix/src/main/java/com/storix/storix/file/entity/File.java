package com.storix.storix.file.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class File {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String mimeType;

    private String category;

    private Long size;

    @Enumerated(EnumType.STRING)
    private StorageProvider provider;

    private String providerFileId;

    private Long folderId;

    private boolean favorite;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

}
