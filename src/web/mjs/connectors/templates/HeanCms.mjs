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
        const url = new URL(`${this.api}/series/${slug}`);
        const request = new Request(url, this.requestOptions);
        const {title, series_slug, id} = await this.fetchJSON(request, this.requestOptions);
        return new Manga(this, JSON.stringify({
             id: id,
             slug:series_slug
        }), title);
    }

    async _getMangas() {
        let mangaList = [];

        for (let page = 1, run = true; run; page++) {
            let list = await this._getMangasFromPage(page, true);
            list.length > 0 ? mangaList.push(...list) : run = false;
        }

        for (let page = 1, run = true; run; page++) {
            let list = await this._getMangasFromPage(page, false);
            list.length > 0 ? mangaList.push(...list) : run = false;
        }

        return mangaList;
    }

    async _getMangasFromPage(page, adult) {
        const request = new Request(new URL(`${this.api}/query?perPage=100&page=${page}&adult=${adult}`), this.requestOptions);
        const {data} = await this.fetchJSON(request);

        if (data.length) {
            return data.map((manga) => {
                return {
                    id : JSON.stringify({id : manga.id, slug : manga.series_slug}),
                    title: manga.title
                };
            });
        }
        return [];
    }

    async _getChapters(manga) {
        let chapterList = await this.getchaptersV1(manga);
        if (chapterList.length == 0 ) chapterList = await this.getchaptersV2(manga);
        return chapterList;

    }

    async getchaptersV1(manga) {
        try {
            const slug = JSON.parse(manga.id).slug;
            const uri = new URL(`${this.api}/series/${slug}`);
            const request = new Request(uri, this.requestOptions);
            const {seasons} = await this.fetchJSON(request);
            const chapterList = [];
            seasons.map((season) => season.chapters.map((chapter) => {
                chapterList.push({
                    id: JSON.stringify({
                        id: chapter.id,
                        slug: chapter.chapter_slug
                    }),
                    title: `${seasons.length > 1 ? 'S' + season.index : ''} ${chapter.chapter_name} ${chapter.chapter_title || ''}`.trim()
                });
            }));
            return chapterList;
        } catch (error) {
            return [];
        }

    }

    async getchaptersV2(manga) {
        const mangaid = JSON.parse(manga.id);
        const uri = new URL(`${this.api}/chapter/query?series_id=${mangaid.id}&perPage=9999&page=1)`);
        const request = new Request(uri, this.requestOptions);
        const { data } = await this.fetchJSON(request, this.requestOptions);
        return data.map( chapter => {
            return {
                id: JSON.stringify({
                    slug: chapter.chapter_slug,
                    id: chapter.id}),
                title: `${chapter.chapter_name} ${chapter.chapter_title || ''}`.trim()

            };
        });

    }

    async _getPages(chapter) {
        const chapterid = JSON.parse(chapter.id);
        const mangaid = JSON.parse(chapter.manga.id);
        const uri = new URL(`${this.api}/chapter/${mangaid.slug}/${chapterid.slug}`);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request, this.queryPages);

        // check for paywall
        if (data.paywall) {
            throw new Error(`${chapter.title} is paywalled. Please login.`);
        }

        // check if novel
        if (data.chapter.chapter_type.toLowerCase() === 'novel') {
            return await this._getNovel(mangaid.slug, chapterid.slug);
        }

        const listImages = data.data || data.chapter.chapter_data.images;
        return listImages.map(image => {
            let link = this.computePageUrl(image, data.chapter.storage);
            link = this.DeProxifyStatically(link);
            return this.createConnectorURI(link);
        });

    }

    computePageUrl(image, storage) {
        switch (storage) {
            case "s3": return new URL(image).href;
            case "local": return new URL(image, this.api).href;
        }
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
        const request = new Request(payload, this.requestOptions);
        request.headers.set('x-referer', this.url);
        const response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }

    // copy pasted from https://github.com/manga-download/haruneko/blob/master/web/src/engine/transformers/ImageLinkDeProxifier.ts
    DeProxifyStatically(uri) {
        const url = uri
            .replace(/cdn\.statically\.io\/img\/(bacakomik\/)?/, '')
            .replace(/\/(w=\d+|h=\d+|q=\d+|f=auto)(,(w=\d+|h=\d+|q=\d+|f=auto))*\//, '/');
        return new URL(url).href;
    }
}
