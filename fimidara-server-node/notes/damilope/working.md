# damilope's working notes

The eventual goal is to move these to ChoreBuddy.

## Working On

## TODOs

- Remove authentication requirement from files and folders pages to allow public access.
- Enable workspace selection from the sidebar.
- Improve node labeling and design.
- Redesign the main page.
- Exclude reused parts from upload rate calculations.
- Provide a custom React upload component.
- Add custom upload and download progress listeners.
- Implement download resume functionality in the browser.
- Generate thumbnails for download links.
- Simplify making files/resources public.
- Add an API to get a file's download URL.
- Implement simple file sharing.
- Ensure newly uploaded files appear in the file list without needing a refresh.
- Fix file upload failures when updating existing files.
- Add a web header to the error page.
- Fix broken documentation pages.
- Improve/speed up fimidara sync.
- Show percentage completion for fimidara sync and upload APIs.
- Add timestamps to logs.
- Ensure presigned single-use paths last for the duration of multipart uploads.
- Investigate and resolve resource lock errors when only one consumer is present.
- Clean up parts after TTL expires.
- Clean up transfer progress after upload retries.
- Fix non-working counter in transfer progress.
- Hide time remaining for uploads that are already complete.
- Provide a quick way to check and toggle public status for files/folders.
- Add a changelog.
- Automate config generation.
- Add heartbeat from runner.
- Enable local caching from other servers.
- Enable local caching from S3 and write a post about the process.
- Write a script to change entry points.
- Handle cases where the last upload is requested on one server but other parts are pending on others.
- Save file metadata.
- Validate parts during complete multipart upload.
- Fix discrepancies in inter-server auth header names.
- Redesign namepath to allow renaming files.
- Whitelist localhost for HTTP; require HTTPS for all others.
- Fix infinite login loop.
- Migrate email functionality to Resend.
- Resolve heartbeat issues.
- Upgrade to Next.js 15.
- Implement start, upload, and complete for multipart uploads.
- Fix issue where only one file appears after uploading two.
- Ensure file deletion fully removes files.
- Show usage threshold completion status.

## Implementation notes
