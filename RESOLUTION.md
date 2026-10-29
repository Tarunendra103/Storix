We have fixed the import in FileService.java and added logging to the syncGoogleDriveFiles method and GoogleDriveProvider.listFiles method. The changes are:

1. In FileService.java:
   - Fixed the import: changed `import java.io OutputStream;` to `import java.io.OutputStream;`
   - Added logging to the syncGoogleDriveFiles method to log the processing of each account, the number of files received, and the number of files updated/inserted/deleted.
   - Added logging to the GoogleDriveProvider.listFiles method to log any errors when fetching files from Google Drive.

2. The changes ensure that we can see in the logs whether the second account is being processed and whether its files are being fetched from Google Drive.

The existing tests pass after fixing the import.

We have not changed the working total-storage calculation, the Google OAuth flow, or the removal of mock/demo data.

The fix ensures that the second account's files are now visible in the logs, which will help diagnose why they were not appearing in the UI.

If the second account's files are still not appearing, the logs will show whether the account is being processed, how many files are received from Google Drive, and whether there are any errors in fetching the files.