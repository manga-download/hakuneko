import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Agitoon extends Connector {

    constructor() {
        super();
        super.id = 'agitoon';
        super.label = 'Agitoon';
        this.tags = [ 'webtoon', 'korean' ];
        this.url = 'https://agit185.com';
        this.cdns = [];
        this.img_per = [];

    }

    async _initializeConnector() {
        await this._getNeededValues();
    }

    async _getNeededValues() {
        const uri = new URL(`/data/azitoon.js?v=${Math.random()}`, this.url);
        const request = new Request(uri, this.requestOptions);
        request.headers.set('x-referer', this.url);
        let response = await fetch(request);
        response = await response.text();

        let matches = undefined;
        const imgRgx = /var img_domain\d?\s*=\s*"([\S]+)";/g;
        this.cdns = [];
        // eslint-disable-next-line no-cond-assign
        while (matches = imgRgx.exec(response)) {
            this.cdns.push(matches[1]);
        }

        const img_perRgx = /var img_per\d?\s*=\s*"([\S]+)";/g;
        this.img_per = [];
        // eslint-disable-next-line no-cond-assign
        while (matches= img_perRgx.exec(response)) {
            this.img_per.push(parseInt(matches[1]));
        }
    }

    //CDN is calculated from CHAPTER ID
    _getMangaCDN(chapterid) { //adapted from chapter html page script "show_content_img"
        if(chapterid % 100< this.img_per[1]) {
            return this.cdns[1];
        } else if(chapterid % 100<this.img_per[1]+this.img_per[2]) {
            return this.cdns[2];
        } else if(chapterid % 100<this.img_per[1]+this.img_per[2] + this.img_per[3]) {
            return this.cdns[3];
        } else if(chapterid % 100<this.img_per[1]+this.img_per[2] + this.img_per[3] + this.img_per[4]) {
            return this.cdns[4];
        } else{
            return this.cdns[0];
        }

    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'title');
        let id = uri.pathname.match(/\/azi_toon\/(\d+)\.html/)[1];
        let title = data[0].text.split(' - ')[1].trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const paths = ['/data/azi_webtoon_0.js?v=_', '/data/azi_webtoon_1.js?v=_'];
        const mangalist = [];
        for (const path of paths) {
            mangalist.push(... await this._fetchJSONMangas(path));
        }
        return mangalist;

    }

    async _fetchJSONMangas(path) {
        const request = new Request(new URL(path, this.url));
        request.headers.set('x-referer', this.url);
        let response = await fetch(request);
        response = await response.text();
        const data = JSON.parse(response.match(/var data\d{1}\s*=\s*([\W\S]+);/)[1]);
        return data.map(element => {
            return {
                id: element.x,
                title: element.t.trim()
            };
        });
    }
    async _getChapters(manga) {
        const uri = new URL(`/data/toonlist/${manga.id}.js?v=${Math.random()}`, this.url);
        const request = new Request(uri, this.requestOptions );
        request.headers.set('x-referer', this.url);
        let response = await fetch(request);
        response = await response.text();
        const data = JSON.parse(response.match(/var clist\s*=\s*([\W\S]+);/)[1]);
        return data.map(element => {
            return {
                id: element.u,
                title: element.t.replace(manga.title, '').replace('- ', '').trim(),
            };
        });
    }

    async _getPages(chapter) {
        const chapterid = chapter.id.match(/\/(\d+)\.html/)[1];
        const mangadomain = this._getMangaCDN(chapterid);
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions );
        const data = await this.fetchDOM(request, 'div#toon_content_imgs source');
        return data.map(link => this.getAbsolutePath(link.getAttribute('o_src'), mangadomain));
    }

}
