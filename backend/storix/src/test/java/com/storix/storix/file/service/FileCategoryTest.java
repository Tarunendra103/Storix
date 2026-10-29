package com.storix.storix.file.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class FileCategoryTest {

    @Test
    void classifiesMimeTypesAndExtensionFallbacksConsistently() {
        assertEquals(FileCategory.FOLDERS, FileCategory.classify("application/vnd.google-apps.folder", "Design"));
        assertEquals(FileCategory.PHOTOS, FileCategory.classify("application/octet-stream", "holiday.HEIC"));
        assertEquals(FileCategory.VIDEOS, FileCategory.classify("video/mp4", "clip.bin"));
        assertEquals(FileCategory.DOCUMENTS, FileCategory.classify("application/vnd.google-apps.spreadsheet", "Budget"));
        assertEquals(FileCategory.AUDIO, FileCategory.classify(null, "podcast.flac"));
        assertEquals(FileCategory.ARCHIVES, FileCategory.classify("application/octet-stream", "source.7z"));
        assertEquals(FileCategory.OTHER, FileCategory.classify(null, "unclassified"));
    }
}
