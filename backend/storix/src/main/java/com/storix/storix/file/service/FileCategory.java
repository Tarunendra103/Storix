package com.storix.storix.file.service;

import java.util.Locale;
import java.util.Set;

/**
 * The single category contract used for metadata persisted from cloud providers.
 * Category values are deliberately provider-neutral, while MIME types remain the
 * source of truth for the original file format.
 */
public final class FileCategory {
    public static final String FOLDERS = "FOLDERS";
    public static final String PHOTOS = "PHOTOS";
    public static final String VIDEOS = "VIDEOS";
    public static final String DOCUMENTS = "DOCUMENTS";
    public static final String AUDIO = "AUDIO";
    public static final String ARCHIVES = "ARCHIVES";
    public static final String OTHER = "OTHER";

    private static final String GOOGLE_FOLDER = "application/vnd.google-apps.folder";
    private static final Set<String> IMAGE_EXTENSIONS = Set.of("jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tif", "tiff", "heic", "avif");
    private static final Set<String> VIDEO_EXTENSIONS = Set.of("mp4", "mov", "avi", "mkv", "webm", "wmv", "flv", "m4v");
    private static final Set<String> DOCUMENT_EXTENSIONS = Set.of("pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "rtf", "csv", "md", "odt", "ods", "odp");
    private static final Set<String> AUDIO_EXTENSIONS = Set.of("mp3", "wav", "aac", "flac", "m4a", "ogg", "wma");
    private static final Set<String> ARCHIVE_EXTENSIONS = Set.of("zip", "rar", "7z", "tar", "gz", "bz2", "xz");

    private FileCategory() {
    }

    public static String classify(String mimeType, String fileName) {
        String mime = mimeType == null ? "" : mimeType.toLowerCase(Locale.ROOT);
        if (GOOGLE_FOLDER.equals(mime)) {
            return FOLDERS;
        }
        if (mime.startsWith("image/")) {
            return PHOTOS;
        }
        if (mime.startsWith("video/")) {
            return VIDEOS;
        }
        if (mime.startsWith("audio/")) {
            return AUDIO;
        }
        if (mime.startsWith("text/") || mime.contains("pdf") || mime.contains("document")
                || mime.contains("spreadsheet") || mime.contains("presentation")
                || mime.contains("msword") || mime.contains("excel") || mime.contains("powerpoint")
                || mime.contains("opendocument")) {
            return DOCUMENTS;
        }
        if (mime.contains("zip") || mime.contains("compressed") || mime.contains("archive")
                || mime.contains("x-rar") || mime.contains("x-7z")) {
            return ARCHIVES;
        }

        String extension = extensionOf(fileName);
        if (IMAGE_EXTENSIONS.contains(extension)) return PHOTOS;
        if (VIDEO_EXTENSIONS.contains(extension)) return VIDEOS;
        if (DOCUMENT_EXTENSIONS.contains(extension)) return DOCUMENTS;
        if (AUDIO_EXTENSIONS.contains(extension)) return AUDIO;
        if (ARCHIVE_EXTENSIONS.contains(extension)) return ARCHIVES;
        return OTHER;
    }

    public static String normalize(String category, String mimeType, String fileName) {
        if (category != null) {
            String normalized = category.trim().toUpperCase(Locale.ROOT);
            if (Set.of(FOLDERS, PHOTOS, VIDEOS, DOCUMENTS, AUDIO, ARCHIVES, OTHER).contains(normalized)) {
                return normalized;
            }
        }
        return classify(mimeType, fileName);
    }

    private static String extensionOf(String fileName) {
        if (fileName == null) return "";
        int separator = fileName.lastIndexOf('.');
        if (separator < 1 || separator == fileName.length() - 1) return "";
        return fileName.substring(separator + 1).toLowerCase(Locale.ROOT);
    }
}
