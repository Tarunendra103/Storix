package com.storix.storix.account.entity;

import com.storix.storix.common.Enums.StorageProvider;
import com.storix.storix.auth.security.TokenEncryptionConverter;
import com.storix.storix.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
        uniqueConstraints = @UniqueConstraint(
                name = "uk_connected_account_user_provider_email",
                columnNames = {"user_id", "provider", "account_email"}
        ),
        indexes = @Index(name = "idx_connected_account_user", columnList = "user_id")
)
public class ConnectedAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY,optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StorageProvider provider;

    @Column(nullable = false)
    private String accountEmail;

    @Column(nullable = false, columnDefinition = "TEXT")
    @Convert(converter = TokenEncryptionConverter.class)
    private String accessToken;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = TokenEncryptionConverter.class)
    private String refreshToken;

    private LocalDateTime expiresAt;

    private Long totalStorage;

    private Long usedStorage;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


}
