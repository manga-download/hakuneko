import Connector from '../engine/Connector.mjs';

export default class TopMangasFR extends Connector {

    constructor() {
        super();
        super.id = 'topmangasfr';
        super.label = 'TopMangasFR';
        this.tags = [ 'manga', 'french' ];
        this.url = 'https://topmangas.fr';

    }

    async _getMangas() {
        const request = new Request(this.url, this.requestOptions);
        const data = await this.fetchDOM(request, 'div.u-repeater div.u-list-item h4 a');
        return data.map(element => {
            return {
                id: element.href,
                title : `${element.text.trim()} [${this._getTopLevelDomain(new URL(element.href))}]`
            };
        });
    }

    _getTopLevelDomain(uri) {
        return uri.hostname.split('.').slice(-2).join('.');
    }

    async _getChapters(manga) {
        const request = new Request(manga.id, this.requestOptions);
        const data = await this.fetchDOM(request, 'div#All_chapters ul li ul li a,div#Chapters_List ul ul li a');
        return data.map(element => {
            return {
                id: element.href,
                title : element.text.replace(/scan/i, '').replace(/manga/i, '').replace(/chapitre/i, '').trim()
            };
        });
    }

    async _getPages(chapter) {
        const request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'source.wp-manga-chapter-img, source[decoding], source.img-responsive');
        return data.map(element => {
        	let url = element.dataset['lazySrc'] ? element.dataset['lazySrc'] : element;
        	url = this.getAbsolutePath(url, request.url); 
            //HACK some pages are from wp cache BUT source website is dead (sushiscan), we add a WP pattern to bypass late filter and ensure pics are loaded from WP
            let realwp = url.match(/\/i\d+\.wp\.com/);
            if (realwp != null) {
                //replace /ix.wp.com with /ix.wp.com/i0.wp.com
                url = url.replace(realwp[0], realwp[0]+'/i0.wp.com');
            }
       	    return url;
        });
    }
}