# 06 · Uploads & media

## 1. Endpoint

`POST /uploads` (multipart, field `file`, auth required) → `{ fileUrl: "/api/v1/uploads/<name>" }`

| Form field | Values | Effect |
|---|---|---|
| `visibility` | `private` | Only the uploader, admins and linked parties can read it (ID, selfie, private chat images) |
| (absent) | public | Avatars, task photos, portfolio, work proof, offer images |

Limits: images only (JPEG/PNG/WebP), `UPLOAD_MAX_SIZE_MB` (5 MB). Compress on device first
(`imageQuality: 80`, `maxWidth: 1600`).

`GET /uploads/<name>` serves the file: public → anyone; private → 401/403 without the right auth header.

## 2. Flow (every feature)

1. Pick (`image_picker`, `pickMultiImage(limit:)` for multi).
2. **Keep the local path** for instant preview (`Image.file`).
3. Upload each file with `UploadService.uploadImage(file, visibility?, onSendProgress)`; show per-item progress.
4. Store the returned `fileUrl` alongside the local path (`List<({String local, String url})>`).
5. Submit the feature request with the URLs (`imageUrls`, `idFrontImage`, `selfieImageUrl`, `paymentProofUrl`…).
6. The backend links uploads to the entity (`linkUploads`) — ownership is checked by uploader id.

Never preview with `Image.file(serverUrl)` (shows a broken placeholder — real bug fixed in work-proof sheet).

## 3. Displaying

- Resolve relative URLs with `AppUrlHelper.resolveImageUrl` (prefixes the API host).
- Private images: `CachedNetworkImage(httpHeaders: {'Authorization': 'Bearer …'})`.
- Always provide `errorBuilder` with a neutral placeholder and a size-matched shimmer while loading.

## 4. Where each feature uses uploads

| Feature | Field | Visibility |
|---|---|---|
| Verification ID front/back, selfie | `idFrontImage`, `idBackImage`, `selfieImageUrl` | private |
| Task photos (wizard) | `imageUrls[]` | public |
| Work proof | `imageUrls[]` | public (linked to task) |
| Chat image | `imageUrl` | public (room-linked) |
| Avatar | `avatarUrl` (PUT /profile) | public |
| Portfolio | `POST /craftsmen/portfolio { imageUrl }` | public |
| Bit receipt (subscription/commission) | `paymentProofUrl` | public (admin-reviewed) |
