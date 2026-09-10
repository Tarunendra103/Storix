package com.storix.storix.file.repository;

import com.storix.storix.file.entity.File;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FileRepository extends JpaRepository<File,Long> {
    List<File> findAllByUserId(Long userId);

    Optional<File> findByIdAndUserId(Long id, Long userId);
}
