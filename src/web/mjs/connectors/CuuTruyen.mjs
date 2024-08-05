import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class CuuTruyen extends Connector {
    constructor() {
        super();
        super.id = 'cuutruyen';
        super.label = 'Cứu Truyện';
        this.tags = ['manga', 'vietnamese'];
        this.url = 'https://cuutruyen.net';
    }

    async _getMangaFromURI(uri) {
        const mangaid = uri.href.match(/\/mangas\/([0-9]+)/)[1];
        const req = new URL('/api/v2/mangas/' + mangaid, this.url);
        const request = new Request(req, this.requestOptions);
        const data = await this.fetchJSON(request);
        return new Manga(this, mangaid, data.data.name.trim());
    }

    async _getMangas() {
        const uri = new URL('/api/v2/mangas/recently_updated?page=1&per_page=30', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        const pages = data._metadata.total_pages;

        const mangaList = this._getMangasFromPage(data);

        for (let page = 2; page <= pages; page++) {
            const uri = new URL(`/api/v2/mangas/recently_updated?page=${page}&per_page=30`, this.url);
            const request = new Request(uri, this.requestOptions);
            const data = await this.fetchJSON(request);
            const mangas = await this._getMangasFromPage(data);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    _getMangasFromPage(data) {
        return data.data.map((c) => ({
            id: c.id,
            title: c.name.trim(),
        }));
    }

    async _getChapters(manga) {
        const uri = new URL('/api/v2/mangas/' + manga.id + '/chapters', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.data
            .filter((c) => c.status === 'processed')
            .map((c) => {
                let title = `Chapter ${c.number}`;

                if (c.name) {
                    title += `: ${c.name}`;
                }

                return { id: c.id, title };
            });
    }

    async _getPages(chapter) {
        const uri = new URL('/api/v2/chapters/' + chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);

        if (data.data.pages.some((image) => image.status !== 'processed')) {
            throw new Error('This chapter is still processing, please try again later.');
        }

        const pages = data.data.pages.filter((image) => image.status === 'processed');

        return pages.map((image) => {
            return this.createConnectorURI({
                url: image.image_url,
                drmData: image.drm_data,
            });
        });
    }

    async _handleConnectorURI(payload) {
        const resp = await fetch(payload.url, {
            redirect: 'follow',
            credentials: 'same-origin',
            cache: 'no-cache',
            referrer: `${this.url}/`,
            headers: {
                'accept': 'image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5',
                'x-referer': `${this.url}/`,
            },
        });

        if (!payload.drmData) {
            return this._blobToBuffer(await resp.blob());
        }

        const decryptedDrmData = this.decodeXorCipher(atob(payload.drmData), '3141592653589793');

        if (!decryptedDrmData.startsWith('#v4|')) {
            throw new Error(`Invalid DRM data (does not start with magic bytes): ${decryptedDrmData}`);
        }

        const image = await createImageBitmap(await resp.blob());
        const canvas = document.createElement('canvas');

        canvas.width = image.width;
        canvas.height = image.height;

        const ctx = canvas.getContext('2d');
        let sy = 0;

        for (const t of decryptedDrmData.split('|').slice(1)) {
            const [dy, height] = t.split('-', 2).map(Number);

            ctx.drawImage(image, 0, sy, image.width, height, 0, dy, image.width, height);
            sy += height;
        }

        return this._blobToBuffer(await this._canvasToBlob(canvas));
    }

    _canvasToBlob(canvas) {
        return new Promise(resolve => {
            canvas.toBlob(data => {
                resolve(data);
            }, Engine.Settings.recompressionFormat.value, parseFloat(Engine.Settings.recompressionQuality.value) / 100);
        });
    }

    decodeXorCipher(data, key) {
        let output = "";

        for (let i = 0; i < data.length; i++) {
            output += String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }

        return output;
    }
}
