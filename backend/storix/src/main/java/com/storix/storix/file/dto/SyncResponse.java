package com.storix.storix.file.dto;

/** A safe summary of a multi-account sync; provider internals are kept in server logs. */
public record SyncResponse(int syncedAccounts, int failedAccounts) {
}
