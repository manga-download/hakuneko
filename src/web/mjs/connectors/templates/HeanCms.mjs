import Connector from '../../engine/Connector.mjs';
import Manga from '../../engine/Manga.mjs';

export default class HeanCms extends Connector {
    constructor() {
        super();
        super.id = undefined;
        super.label = undefined;
        this.url = undefined;
        this.api = undefined;
        this.path = '';
        this.novelContainer = 'div.container';
        this.novelContentQuery = 'div#reader-container';
        this.novelFormat = 'image/png';
        this.novelWidth = '56em';// parseInt(1200 / window.devicePixelRatio) + 'px';
        this.novelPadding = '1.5em';
    }

    async _getMangaFromURI(uri) {
        const slug = uri.pathname.split('/')[2];
        const url = new URL(`/series/${slug}`, this.api);
        const request = new Request(url, this.requestOptions);
        const {title, series_slug} = await this.fetchJSON(request, this.requestOptions);
        return new Manga(this, series_slug, title);
    }

    async _getMangas() {
        let mangaList = [];

        for (let page = 1, run = true; run; page++) {
            let list = await this._getMangasFromPage(page);
            list.length > 0 ? mangaList.push(...list) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const request = new Request(new URL(`/query?series_type=All&order=asc&perPage=100&page=${page}`, this.api), this.requestOptions);
        const {data} = await this.fetchJSON(request);

        if (data.length) {
            return data.map((manga) => {
                return {
                    id: manga.series_slug,
                    title: manga.title
                };
            });
        }
        return [];
    }

    async _getChapters(manga) {
        const uri = new URL(`/series/${manga.id}`, this.api);
        const request = new Request(uri, this.requestOptions);
        const {seasons} = await this.fetchJSON(request);
        let chapterList = [];

        seasons.map((season) => season.chapters.map((chapter) => {
            chapterList.push({
                id: JSON.stringify({
                    series: manga.id,
                    chapter: chapter.chapter_slug
                }),
                title: `${seasons.length > 1 ? 'S' + season.index : ''} ${chapter.chapter_name} ${chapter.chapter_title || ''}`.trim()
            });
        }));
        return chapterList;
    }

    async _getPages(chapter) {
        const id = JSON.parse(chapter.id);
        const uri = new URL(`/chapter/${id.series}/${id.chapter}`, this.api);
        const request = new Request(uri, this.requestOptions);
        const {chapter_type, data, paywall} = await this.fetchJSON(request, this.queryPages);

        // check for paywall
        if (data.length < 1 && paywall) {
            throw new Error(`${chapter.title} is paywalled. Please login.`);
        }

        // check if novel
        if (chapter_type.toLowerCase() === 'novel') {
            return await this._getNovel(id.series, id.chapter);
        }

        return data.map((image) => this.createConnectorURI(
            this.DeProxifyStatically(new URL(image)).href
        ));
    }

    async _getNovel(seriesId, chapterId) {
        const darkmode = Engine.Settings.NovelColorProfile();
        const script = `
            new Promise((resolve, reject) => {
                document.body.style.width = '${this.novelWidth}';
                let container = document.querySelector('${this.novelContainer}');
                container.style.maxWidth = '${this.novelWidth}';
                container.style.padding = '0';
                container.style.margin = '0';
	            let novel = document.querySelector('${this.novelContentQuery}');
                novel.style.padding = '${this.novelPadding}';
                [...novel.querySelectorAll(":not(:empty)")].forEach(ele => {
                    ele.style.backgroundColor = '${darkmode.background}'
                    ele.style.color = '${darkmode.text}'
                })
                novel.style.backgroundColor = '${darkmode.background}'
                novel.style.color = '${darkmode.text}'
                let script = document.createElement('script');
                script.onerror = error => reject(error);
                script.onload = async function() {
                    try {
                        let canvas = await html2canvas(novel);
                        resolve([canvas.toDataURL('${this.novelFormat}')]);
                    } catch (error){
                        reject(error)
                    }
                }
                script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
                document.body.appendChild(script);
            });
        `;
        const uri = new URL(`/series/${seriesId}/${chapterId}`, this.url);
        const request = new Request(uri, this.requestOptions);
        return await Engine.Request.fetchUI(request, script, 30000, true);
    }

    async _handleConnectorURI(payload) {
        let request = new Request(payload, this.requestOptions);
        request.headers.set('x-referer', this.url);
        const response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }

    // copy pasted from https://github.com/manga-download/haruneko/blob/master/web/src/engine/transformers/ImageLinkDeProxifier.ts
    DeProxifyStatically(uri) {
        const url = uri.href
            .replace(/cdn\.statically\.io\/img\/(bacakomik\/)?/, '')
            .replace(/\/(w=\d+|h=\d+|q=\d+|f=auto)(,(w=\d+|h=\d+|q=\d+|f=auto))*\//, '/');
        return new URL(url);
    }
}
