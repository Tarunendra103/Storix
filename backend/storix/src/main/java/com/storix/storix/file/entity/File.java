package com.storix.storix.file.entity;

import com.storix.storix.account.entity.ConnectedAccount;
import com.storix.storix.common.Enums.StorageProvider;
import com.storix.storix.user.entity.User;
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

    private String providerFolderId;
    private Long folderId;

    private boolean favorite;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "connected_account_id", nullable = false)
    private ConnectedAccount connectedAccount;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

}
