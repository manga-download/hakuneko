import SpeedBinb from './templates/SpeedBinb.mjs';
import Manga from '../engine/Manga.mjs';

export default class Yanmaga extends SpeedBinb {
    constructor() {
        super();
        super.id = 'yanmaga';
        super.label = 'Yanmaga';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://yanmaga.jp';
        this.links = {
            login: 'https://yanmaga.jp/customers/sign-in'
        };
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri);
        const [data] = await this.fetchDOM(request, '.detailv2-outline-title');
        const id = uri.pathname;
        const title = data.textContent.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const request = new Request(new URL('comics', this.url));
        const data = await this.fetchDOM(request, '.ga-comics-book-item');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.querySelector('.mod-book-title').textContent.trim(),
            };
        });
    }

    async _getChapters(manga) {
        const baseUri = new URL(manga.id, this.url);

        const buttons = await this.fetchDOM(new Request(baseUri, this.requestOptions), 'button.mod-episode-more-button');

        if (buttons.length > 0) {
            const btn = buttons[0];
            const limit = parseInt(btn.getAttribute('data-limit')) || 100;
            const sort = btn.getAttribute('data-sort') || 'older';
            const path = btn.getAttribute('data-path');

            const chapters = await this._fetchChaptersFromAjax(path, limit, sort);
            if (chapters.length > 0) return chapters;
        }

        const links = await this.fetchDOM(new Request(baseUri, this.requestOptions), '.mod-episode ul.mod-episode-list a.mod-episode-link');
        const seen = new Set();
        const chapters = [];
        for (const a of links) {
            const id = new URL(a.getAttribute('href'), this.url).pathname;
            if (seen.has(id)) continue;
            seen.add(id);
            chapters.push({
                id,
                title: a.querySelector('.mod-episode-title').textContent.trim(),
                language: ''
            });
        }
        return chapters;
    }

    async _fetchChaptersFromAjax(path, limit, sort) {
        const itemRe = /data-episode-title=\\"([^"]+?)\\"[\s\S]*?data-original-url=\\"([^"]+?)\\"/g;
        const chapters = [];
        const seen = new Set();
        let offset = 0;

        for (let safety = 0; safety < 50; safety++) {
            const moreUri = new URL(path, this.url);
            moreUri.searchParams.set('offset', offset);
            moreUri.searchParams.set('limit', limit);
            moreUri.searchParams.set('sort', sort);

            const moreReq = new Request(moreUri, this.requestOptions);
            moreReq.headers.set('X-Requested-With', 'XMLHttpRequest');
            moreReq.headers.set('Accept', '*/*');

            let text;
            try {
                const response = await fetch(moreReq);
                text = await response.text();
            } catch (e) {
                console.error('[Yanmaga] AJAX fetch failed', e);
                break;
            }

            const found = [];
            itemRe.lastIndex = 0;
            let m;
            while ((m = itemRe.exec(text)) !== null) {
                const id = m[2];
                if (seen.has(id)) continue;
                seen.add(id);
                found.push({ id, title: m[1], language: '' });
            }

            if (found.length === 0) break;
            chapters.push(...found);
            offset += found.length;
            if (found.length < limit) break;
        }

        return chapters;
    }

    _getPageList( manga, chapter, callback ) {
        const uri = new URL(chapter.id, this.url);
        fetch(uri)
            .then(response => {
                if (response.redirected) {
                    const newurl = new URL(response.url);
                    return super._getPageList(manga, { id: newurl.pathname+newurl.search }, callback);
                }
                if (!uri.searchParams.get('cid')) {
                    throw new Error(`You need to login to see ${chapter.title}`);
                }
                return super._getPageList(manga, chapter, callback);
            })
            .catch(error => {
                console.error(error, chapter);
                callback(error, undefined);
            });
    }
}
