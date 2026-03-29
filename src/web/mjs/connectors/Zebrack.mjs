import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Zebrack extends Connector {

    constructor() {
        super();
        super.id = 'zebrack';
        super.label = 'Zebrack (ゼブラック)';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://zebrack-comic.shueisha.co.jp';
        this.apiURL = 'https://api.zebrack-comic.com';
        this.protoTypes = '/mjs/connectors/Zebrack.proto';

        this.secretKey = '';
        this.responseRootType = 'Zebrack.Response';
        this.gravureDetailRootType = 'Zebrack.GravureDetailViewV3';
        this.magazineDetailRootType = 'Zebrack.MagazineDetailViewV3';
        this.chapterListRootType = 'Zebrack.TitleChapterListViewV3';
        this.chapterRootType = 'Zebrack.ChapterViewerViewV3';
        this.volumeRootType = 'Zebrack.VolumeViewerViewV3';
        this.gravureRootType = 'Zebrack.GravureViewerViewV3';
    }

    async _getMangaFromURI(uri) {
        const parts = uri.pathname.split('/');
        if (parts[1] === 'magazine') {
            const magazineId = parts[2];
            const magazineIssueId = parts[4];
            const data = await this._fetchMagazineDetail(magazineId, magazineIssueId);
            return new Manga(this, uri.pathname, `${data.magazine.magazineName} ${data.magazine.issueName}`);
        }
        if (parts[1] === 'gravure') {
            const gravureId = parts[2];
            const data = await this._fetchGravureDetail(gravureId);
            return new Manga(this, uri.pathname, data.gravure.name);
        }
        const titleId = parts[2];
        const data = await this._fetchTitleDetail(titleId);
        return new Manga(this, uri.pathname, data.titleDetailView.titleName);
    }

    async _getMangas() {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the chapters directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        const parts = manga.id.split('/');
        let type = parts[3] || 'chapter';
        if (['magazine', 'gravure'].includes(parts[1])) {
            type = parts[1];
        }
        if (type === 'chapter') {
            const id = parts[2];
            const data = await this._fetchChapterList(id);
            const chapters = [];
            data.groups.forEach(group => {
                chapters.push(...group.chapters);
            });
            return chapters.map(chapter => {
                return {
                    id: `chapter/${chapter.titleId}/${chapter.id}`,
                    title: chapter.mainName,
                };
            });
        }

        if (type === 'volume_list' || type === 'volume') {
            const id = parts[2];
            const data = await this._fetchVolumeList(id);
            const volumes = data.volumeListView.volumes;
            return volumes.map(volume => {
                return {
                    id: `volume/${volume.titleId}/${volume.volumeId}`,
                    title: volume.volumeName,
                };
            });
        }

        if (type === 'magazine') {
            const magazineId = parts[2];
            const magazineIssueId = parts[4];
            return [{
                id: `magazine/${magazineId}/${magazineIssueId}`,
                title: manga.title,
            }];
        }

        if (type === 'gravure') {
            return [{
                id: manga.id.slice(1),
                title: manga.title,
            }];
        }

        return [];
    }

    async _getPages(chapter) {
        const [type, titleId, chapterId] = chapter.id.split('/');
        const request = new Request(new URL(this.url), this.requestOptions);
        this.secretKey = await Engine.Request.fetchUI(request, 'localStorage.getItem("device_secret_key") || ""');
        if (type === 'chapter') {
            const data = await this._fetchChapterViewer(titleId, chapterId);
            if (data.pages) {
                return data.pages
                    .filter(page => page.image && page.image.imageUrl)
                    .map(page => this.createConnectorURI(page.image));
            }
        }
        if (type === 'volume') {
            const data = await this._fetchVolumeViewer(titleId, chapterId);
            if (data.pages) {
                return data.pages
                    .filter(page => page.image && page.image.imageUrl)
                    .map(page => this.createConnectorURI(page.image));
            }
        }
        if (type === 'magazine') {
            const data = await this._fetchMagazineViewer(titleId, chapterId);
            if (data.magazineViewerView) {
                return data.magazineViewerView.images
                    .filter(image => image && image.imageUrl)
                    .map(image => this.createConnectorURI(image));
            }
        }
        if (type === 'gravure') {
            const data = await this._fetchGravureViewer(titleId);
            if (data.images) {
                return data.images.map(image => image.imageUrl);
            }
        }

        throw new Error('No image data available, make sure your account is logged in and the chapter is purchased!');
    }

    async _handleConnectorURI(payload) {
        const uri = new URL(payload.imageUrl);
        const request = new Request(uri, this.requestOptions);
        const response = await fetch(request);
        const buffer = await response.arrayBuffer();
        const data = {
            mimeType: response.headers.get('content-type'),
            data: await this._decryptXOR(buffer, payload.encryptionKey)
        };
        this._applyRealMime(data);
        return data;
    }

    _decryptXOR(encrypted, key) {
        if (key) {
            let t = new Uint8Array(key.match(/.{1,2}/g).map(e => parseInt(e, 16)));
            let s = new Uint8Array(encrypted);
            for (let n = 0; n < s.length; n++) {
                s[n] ^= t[n % t.length];
            }
            return s;
        } else {
            return encrypted;
        }
    }

    async _fetchTitleDetail(titleId) {
        const uri = new URL('/api/browser/title_detail', this.apiURL);
        uri.searchParams.set('os', 'browser');
        uri.searchParams.set('title_id', titleId);
        const request = new Request(uri, this.requestOptions);
        return this.fetchPROTO(request, this.protoTypes, this.responseRootType);
    }

    async _fetchMagazineDetail(magazineId, magazineIssueId) {
        const uri = new URL('/api/v3/magazine_issue_detail', this.apiURL);
        uri.searchParams.set('os', 'browser');
        uri.searchParams.set('magazine_id', magazineId);
        uri.searchParams.set('magazine_issue_id', magazineIssueId);
        const request = new Request(uri, this.requestOptions);
        return this.fetchPROTO(request, this.protoTypes, this.magazineDetailRootType);
    }

    async _fetchGravureDetail(gravureId) {
        const uri = new URL('/api/v3/gravure_detail', this.apiURL);
        uri.searchParams.set('os', 'browser');
        uri.searchParams.set('gravure_id', gravureId);
        const request = new Request(uri, this.requestOptions);
        return this.fetchPROTO(request, this.protoTypes, this.gravureDetailRootType);
    }

    async _fetchChapterList(id) {
        const uri = new URL('/api/v3/title_chapter_list', this.apiURL);
        uri.searchParams.set('os', 'browser');
        uri.searchParams.set('title_id', id);
        const request = new Request(uri, this.requestOptions);
        return this.fetchPROTO(request, this.protoTypes, this.chapterListRootType);
    }

    async _fetchVolumeList(id) {
        const uri = new URL('/api/browser/title_volume_list', this.apiURL);
        uri.searchParams.set('os', 'browser');
        uri.searchParams.set('title_id', id);
        const request = new Request(uri, this.requestOptions);
        return this.fetchPROTO(request, this.protoTypes, this.responseRootType);
    }

    async _fetchChapterViewer(titleId, chapterId) {
        const uri = new URL('/api/v3/chapter_viewer', this.apiURL);
        const params = new URLSearchParams();
        params.set('secret', this.secretKey);
        params.set('os', 'browser');
        params.set('title_id', titleId);
        params.set('chapter_id', chapterId);
        params.set('type', 'normal');
        const request = new Request(uri, {
            ...this.requestOptions,
            method: 'POST',
            body: params.toString(),
        });
        request.headers.set('content-type', 'application/x-www-form-urlencoded');
        return this.fetchPROTO(request, this.protoTypes, this.chapterRootType);
    }

    async _fetchVolumeViewer(titleId, volumeId) {
        const uri = new URL('/api/v3/manga_volume_viewer', this.apiURL);
        uri.searchParams.set('secret', this.secretKey);
        uri.searchParams.set('is_trial', '0');
        uri.searchParams.set('os', 'browser');
        uri.searchParams.set('title_id', titleId);
        uri.searchParams.set('volume_id', volumeId);
        const request = new Request(uri, this.requestOptions);
        return this.fetchPROTO(request, this.protoTypes, this.volumeRootType);
    }

    async _fetchMagazineViewer(magazineId, magazineIssueId) {
        const uri = new URL('/api/browser/magazine_viewer', this.apiURL);
        uri.searchParams.set('secret', this.secretKey);
        uri.searchParams.set('is_trial', '0');
        uri.searchParams.set('os', 'browser');
        uri.searchParams.set('magazine_id', magazineId);
        uri.searchParams.set('magazine_issue_id', magazineIssueId);
        const request = new Request(uri, this.requestOptions);
        return this.fetchPROTO(request, this.protoTypes, this.responseRootType);
    }

    async _fetchGravureViewer(gravureId) {
        const uri = new URL('/api/v3/gravure_viewer', this.apiURL);
        uri.searchParams.set('secret', this.secretKey);
        uri.searchParams.set('is_trial', '0');
        uri.searchParams.set('os', 'browser');
        uri.searchParams.set('gravure_id', gravureId);
        const request = new Request(uri, this.requestOptions);
        return this.fetchPROTO(request, this.protoTypes, this.gravureRootType);
    }
}
