// Storage.mjs uses ES module imports which Jest cannot require directly.
// We test the _correctBlobMime logic by extracting it as a standalone function
// that mirrors the implementation in Storage.mjs (lines ~860-893).

// Polyfill Blob.prototype.arrayBuffer for Node/Jest environment
if (!Blob.prototype.arrayBuffer) {
    Blob.prototype.arrayBuffer = function() {
        return new Response(this).arrayBuffer();
    };
}

/**
 * Mirrors Storage._correctBlobMime from Storage.mjs.
 * Any changes to the implementation must be reflected here.
 */
async function correctBlobMime(blob) {
    let header = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
    let detectedType = null;

    if (header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50) {
        detectedType = 'image/webp';
    } else if (header[0] === 0xFF && header[1] === 0xD8 && header[2] === 0xFF) {
        detectedType = 'image/jpeg';
    } else if (header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
        detectedType = 'image/png';
    } else if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46) {
        detectedType = 'image/gif';
    } else if (header[0] === 0x42 && header[1] === 0x4D) {
        detectedType = 'image/bmp';
    }

    if (detectedType && detectedType !== blob.type) {
        return new Blob([blob], { type: detectedType });
    }
    return blob;
}

/**
 * Mirrors Storage._pdfImageType from Storage.mjs.
 */
function pdfImageType(image) {
    if (image.type === 'image/jpeg') {
        return 'JPEG';
    }
    if (image.type === 'image/png') {
        return 'PNG';
    }
    return undefined;
}

describe('Storage MIME correction', () => {

    describe('_correctBlobMime', () => {

        it('should correct a webp blob mislabeled as image/jpeg', async () => {
            // RIFF....WEBP header
            const bytes = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
            const blob = new Blob([bytes], { type: 'image/jpeg' });

            const result = await correctBlobMime(blob);

            expect(result.type).toBe('image/webp');
        });

        it('should correct a webp blob mislabeled as image/png', async () => {
            const bytes = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
            const blob = new Blob([bytes], { type: 'image/png' });

            const result = await correctBlobMime(blob);

            expect(result.type).toBe('image/webp');
        });

        it('should not modify a correctly labeled jpeg blob', async () => {
            const bytes = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
            const blob = new Blob([bytes], { type: 'image/jpeg' });

            const result = await correctBlobMime(blob);

            expect(result.type).toBe('image/jpeg');
            expect(result).toBe(blob); // same object, not re-wrapped
        });

        it('should not modify a correctly labeled png blob', async () => {
            const bytes = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x00]);
            const blob = new Blob([bytes], { type: 'image/png' });

            const result = await correctBlobMime(blob);

            expect(result.type).toBe('image/png');
            expect(result).toBe(blob);
        });

        it('should correct a jpeg blob mislabeled as image/webp', async () => {
            const bytes = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
            const blob = new Blob([bytes], { type: 'image/webp' });

            const result = await correctBlobMime(blob);

            expect(result.type).toBe('image/jpeg');
        });

        it('should correct a png blob mislabeled as image/jpeg', async () => {
            const bytes = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x00]);
            const blob = new Blob([bytes], { type: 'image/jpeg' });

            const result = await correctBlobMime(blob);

            expect(result.type).toBe('image/png');
        });

        it('should correct a gif blob mislabeled as image/jpeg', async () => {
            const bytes = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
            const blob = new Blob([bytes], { type: 'image/jpeg' });

            const result = await correctBlobMime(blob);

            expect(result.type).toBe('image/gif');
        });

        it('should correct a bmp blob mislabeled as image/jpeg', async () => {
            const bytes = new Uint8Array([0x42, 0x4D, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
            const blob = new Blob([bytes], { type: 'image/jpeg' });

            const result = await correctBlobMime(blob);

            expect(result.type).toBe('image/bmp');
        });

        it('should not modify a blob with unrecognized magic bytes', async () => {
            const bytes = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
            const blob = new Blob([bytes], { type: 'application/octet-stream' });

            const result = await correctBlobMime(blob);

            expect(result.type).toBe('application/octet-stream');
            expect(result).toBe(blob);
        });

        it('should preserve blob data after correction', async () => {
            const bytes = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x04, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
            const blob = new Blob([bytes], { type: 'image/jpeg' });

            const result = await correctBlobMime(blob);
            const resultBytes = new Uint8Array(await result.arrayBuffer());

            expect(resultBytes).toEqual(bytes);
        });
    });

    describe('_pdfImageType', () => {

        it('should return JPEG for image/jpeg type', () => {
            expect(pdfImageType({ type: 'image/jpeg' })).toBe('JPEG');
        });

        it('should return PNG for image/png type', () => {
            expect(pdfImageType({ type: 'image/png' })).toBe('PNG');
        });

        it('should return undefined for image/webp type', () => {
            expect(pdfImageType({ type: 'image/webp' })).toBeUndefined();
        });

        it('should return undefined for image/gif type', () => {
            expect(pdfImageType({ type: 'image/gif' })).toBeUndefined();
        });
    });

    describe('PDF magic byte verification (Part 2 defense)', () => {

        async function verifyPdfBytes(page) {
            let pdfImgType = pdfImageType(page);
            if (pdfImgType) {
                let checkBytes = new Uint8Array(await page.data.slice(0, 4).arrayBuffer());
                let bytesMatchClaim = false;
                if (pdfImgType === 'JPEG' && checkBytes[0] === 0xFF && checkBytes[1] === 0xD8) {
                    bytesMatchClaim = true;
                } else if (pdfImgType === 'PNG' && checkBytes[1] === 0x50 && checkBytes[2] === 0x4E && checkBytes[3] === 0x47) {
                    bytesMatchClaim = true;
                }
                if (!bytesMatchClaim) {
                    pdfImgType = null;
                }
            }
            return pdfImgType;
        }

        it('should accept a genuine JPEG', async () => {
            const bytes = new Uint8Array([0xFF, 0xD8, 0xFF, 0xE0]);
            const page = { type: 'image/jpeg', data: new Blob([bytes], { type: 'image/jpeg' }) };

            expect(await verifyPdfBytes(page)).toBe('JPEG');
        });

        it('should accept a genuine PNG', async () => {
            const bytes = new Uint8Array([0x89, 0x50, 0x4E, 0x47]);
            const page = { type: 'image/png', data: new Blob([bytes], { type: 'image/png' }) };

            expect(await verifyPdfBytes(page)).toBe('PNG');
        });

        it('should reject a webp claiming to be JPEG', async () => {
            const bytes = new Uint8Array([0x52, 0x49, 0x46, 0x46]);
            const page = { type: 'image/jpeg', data: new Blob([bytes], { type: 'image/jpeg' }) };

            expect(await verifyPdfBytes(page)).toBeNull();
        });

        it('should reject a webp claiming to be PNG', async () => {
            const bytes = new Uint8Array([0x52, 0x49, 0x46, 0x46]);
            const page = { type: 'image/png', data: new Blob([bytes], { type: 'image/png' }) };

            expect(await verifyPdfBytes(page)).toBeNull();
        });

        it('should return undefined for webp type (triggers canvas fallback)', async () => {
            const bytes = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
            const page = { type: 'image/webp', data: new Blob([bytes], { type: 'image/webp' }) };

            // pdfImageType returns undefined for webp, so the defensive check is never entered
            expect(await verifyPdfBytes(page)).toBeUndefined();
        });
    });
});
