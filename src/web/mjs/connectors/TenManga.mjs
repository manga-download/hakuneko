import TAADD from './TAADD.mjs';

export default class TenManga extends TAADD {

    constructor() {
        super();
        super.id = 'tenmanga';
        super.label = 'TenManga';
        this.tags = ['manga', 'english'];
        this.url = 'http://www.tenmanga.com';
        this.links = {
            login: 'http://www.tenmanga.com/login'
        };

        //this.bypassAdultWarning = true;
        this.queryMangaTitle = 'div.bk-info-box div.bk-name';
        this.queryMangas = 'ul#list_container li dd.book-list > a:first-of-type';
        this.queryChapters = 'div.chp-item a';
        this.queryPages = 'div.option-item-trigger.chp-page-trigger.chp-selection-item';
        this.queryImages = 'div.pic_box';
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id, this.url);
        if (this.bypassAdultWarning) {
            uri.searchParams.set('warning', '1');
            // fix query parameter typo for ninemanga
            uri.searchParams.set('waring', '1');
        }
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            this.cfMailDecrypt(element);
            let data = element.getElementsByClassName("chp-idx")[0].textContent;
            let title = data.replace(new RegExp(manga.title, 'ig'), '').replace(/\s*new$/, '').trim();
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: title,
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryPages);
        return[...data].map(d=>d.attributes.option_val.value)
            .filter((item, index, arr) => {
                return arr.indexOf(item) === index;
            })
            .map(option => this.createConnectorURI(this.getAbsolutePath(option, request.url)));
    }

    async _handleConnectorURI(payload) {
        let request = new Request(new URL(payload, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, this.queryImages);
        let img = data[0].getElementsByClassName('manga_pic')[0].src;
        return this._downloadPicture(this.getAbsolutePath(img, request.url));
    }

    async _downloadPicture(payload) {
        let request = new Request(payload, this.requestOptions);
        let response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}