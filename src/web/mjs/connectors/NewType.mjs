import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class NewType extends Connector {

    constructor() {
        super();
        super.id = 'newtype';
        super.label = 'NewType';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://comic.webnewtype.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'div.section_item--contents ul li h1.contents__ttl');
        let id = uri.pathname + uri.search;
        let title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }

    async _fetchJsonDOM(request, page, query) {
        let data = await this.fetchJSON(request);
        if (data.next !== page) {
            let blobURL = URL.createObjectURL(new Blob([data.html], { type: 'text/html' }));
            data = await this.fetchDOM(new Request(blobURL, this.requestOptions), query);
            URL.revokeObjectURL(blobURL);
        } else {
            data = [];
        }
        return data;
    }

    async _getMangas() {
        const request = new Request(new URL('contents/?refind_search=all/', this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'li.detail__txt--ttl');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.closest('a'), request.url),
                title: element.textContent.trim()
            };
        });
    }

    async _getChapters(manga) {
        let chapterList = [];
        for (let page = 1, run = true; run; page++) {
            let chapters = await this._getChaptersFromPage(manga, page);
            chapters.length > 0 ? chapterList.push(...chapters) : run = false;
        }
        return chapterList.filter((chapter, index) => {
            return index === chapterList.findIndex(item => chapter.id === item.id);
        });
    }

    async _getChaptersFromPage(manga, page) {
        let request = new Request(new URL(`${manga.id}/more/${page}/`, this.url), this.requestOptions);
        let data = await this._fetchJsonDOM(request, page, 'li a h2.detail__txt--ttl-sub');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element.closest('a'), request.url),
                title: element.textContent.replace(manga.title, '').trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div#viewerContainer');
        let link = this.getAbsolutePath(data[0].dataset.url, request.url);
        data = await this.fetchJSON(new Request(link, this.requestOptions));
        return data.map(image => {
            if (Array.isArray(image))
                image = image.filter(url => url.startsWith('/'))[0];
            if (image.includes("/h1200"))
                image = image.substr(0, image.indexOf("/h1200"));
            return this.getAbsolutePath(image, request.url);
        });
    }
}
