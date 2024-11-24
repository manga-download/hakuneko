import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class CyComi extends Connector {

    constructor() {
        super();
        super.id = 'cycomi';
        super.label = 'CyComi';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://cycomi.com';
        this.apiUrl = 'https://web.cycomi.com/api';
    }

    canHandleURI(uri) {
        return /https?:\/\/cycomi\.com\/title\/\d+$/.test(uri.origin);
    }

    async _getMangaFromURI(uri) {
        const id = new URL(uri).pathname.split('/').pop();
        const request = new Request(`${this.apiUrl}/title/detail?titleId=${id}`);
        const { data } = await this.fetchJSON(request);
        return new Manga(this, data.titleId.toString(), data.titleName.trim());
    }

    async _getMangas() {
        const mangaList = [];
        for (let page = 0, run = true; run; page++) {
            const request = new Request(`${this.apiUrl}/home/paginatedList?limit=${50}&page=${page}`);
            const { data } = await this.fetchJSON(request, this.requestOptions);
            const mangas = data.reduce((accumulator, entry) => {
                if (entry) {
                    const titles = entry.titles.map(manga => {
                        return { id: manga.titleId.toString(), title : manga.titleName };
                    });
                    accumulator.push(...titles);
                }
                return accumulator;
            }, []);
            mangas.length ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getChapters(manga) {
        return [
            ... await this._fetchMangaVolumes(manga),
            ... await this._fetchMangaChapters(manga),
        ];
    }

    async _fetchMangaVolumes(manga) {
        const request = new Request(`${this.apiUrl}/singleBook/list?titleId=${manga.id}`, this.requestOptions);
        const { data, resultCode } = await this.fetchJSON(request);
        return resultCode !== 1 || !data.singleBooks ? [] : data.singleBooks.map(volume => {
            const title = [ volume.name, volume.stories ].filter(item => item).join(' - ');
            return {id : '/singleBook/detail?singleBookId=' + volume.id, title };
        });
    }

    async _fetchMangaChapters(manga) {
        const request = new Request(`${this.apiUrl}/chapter/paginatedList?titleId=${manga.id}&sort=1`, this.requestOptions);
        const { data, resultCode } = await this.fetchJSON(request);
        return resultCode !== 1 || !data ? [] : data.map(chapter => {
            const title = [ chapter.name, chapter.subName ].filter(item => item).join(' - ');
            return {id : `/chapter/page/list?titleId=${manga.id}&chapterId=${chapter.id}`, title};
        });
    }

    async _getPages(chapter) {
        if(chapter.id.startsWith('/singleBook/')) {
            return this._fetchVolumePages(chapter);
        }
        if(chapter.id.startsWith('/chapter/')) {
            return this._fetchChapterPages(chapter);
        }
        return [];
    }

    async _fetchVolumePages(volume) {
        const request = new Request(this.apiUrl + volume.id, this.requestOptions);
        const { data: { id, chapters } } = await this.fetchJSON(request);
        return !chapters ? [] : chapters.reduce(async (accumulator, chapter) => {
            const url = `${this.apiUrl}/singleBook/page/list?singleBookId=${id}&chapterId=${chapter.id}`;
            const request = new Request(url, this.requestOptions);
            const { data: { pages }, resultCode } = await this.fetchJSON(request, this.requestOptions);
            return resultCode !== 1 ? accumulator : (await accumulator).concat(this._mapPages(volume, pages));
        }, Promise.resolve([]));
    }

    async _fetchChapterPages(chapter) {
        const uri = new URL(this.apiUrl + chapter.id);
        const request = new Request(uri.origin + uri.pathname, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                titleId: parseInt(uri.searchParams.get('titleId')),
                chapterId: parseInt(uri.searchParams.get('chapterId'))
            })
        });
        const { data: { pages }, resultCode } = await this.fetchJSON(request);
        return resultCode !== 1 ? [] : this._mapPages(chapter, pages);
    }

    _mapPages(container, pages) {
        return pages.filter(page => page.type === 'image')
            .sort((self, other) => self.pageNumber - other.pageNumber)
            .map(page => page.image.includes('/end_page/') ? page.image : this.createConnectorURI(page.image));
    }

    async _handleConnectorURI(payload) {
        const uri = new URL(payload);
        const request = new Request(uri, this.requestOptions);
        const response = await fetch(request);
        const buffer = await response.arrayBuffer();
        const passphrase = new URL(payload).pathname.split('/').filter(part => /^[0-9a-zA-Z]{32}$/.test(part)).shift();
        const data = {
            mimeType: response.headers.get('content-type'),
            data: this.decrypt(new Uint8Array(buffer), passphrase)
        };
        this._applyRealMime(data);
        return data;
    }

    _makeKey(passphrase) {
        const key = new Uint8Array(Array(256).keys());
        for(let index = 0, indexSwap = 0; index < key.length; index++) {
            indexSwap = (indexSwap + key[index] + passphrase.charCodeAt(index % passphrase.length)) % 256;
            const temp = key[index];
            key[index] = key[indexSwap];
            key[indexSwap] = temp;
        }
        return key;
    }

    decrypt(encrypted, passphrase) {
        const key = this._makeKey(passphrase);
        const decrypted = new Uint8Array(encrypted.length);
        for (let index = 0, indexKeySwapSource = 0, indexKeySwapTarget = 0; index < encrypted.length; index++) {
            indexKeySwapSource = (indexKeySwapSource + 1) % 256;
            indexKeySwapTarget = (indexKeySwapTarget + key[indexKeySwapSource]) % 256;
            const temp = key[indexKeySwapSource % 256];
            key[indexKeySwapSource % 256] = key[indexKeySwapTarget],
            key[indexKeySwapTarget] = temp;
            const xor = key[(key[indexKeySwapSource] + key[indexKeySwapTarget]) % 256];
            decrypted[index] = encrypted[index] ^ xor;
        }
        return decrypted;
    }
}
