import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaLivre extends Connector {

    constructor() {
        super();
        super.id = 'mangalivre';
        super.label = 'Manga Livre';
        this.tags = [ 'manga', 'portuguese', 'webtoon' ];
        this.url = 'https://mangalivre.com';
    }

    async _getMangas() {
        let page = 1;
        let morePages = true;

        let mangas = [];

        while ( morePages ) {
            try {
                let request = new Request(new URL('/series/index/nome/todos?page=' + page++, this.url), this.requestOptions);
                let data = await this.fetchDOM(request, 'div.seriesList ul.seriesList li > a.link-block');

                mangas.push(...data.map(manga => {
                    let title = manga.title.match(/^Ler\s(.*)\sOnline$/);
                    return {
                        id: manga.pathname.match(/\d+$/)[0],
                        title: title ? title[1].trim() : manga.title
                    };
                }));

            } catch(error) {
                morePages = false;
            }
        }

        return mangas;
    }

    async _getChapters(manga) {
        let page = 1;
        let morePages = true;

        let request, data;
        let chapters = [];

        let url = new URL('/series/chapters_list.json', this.url);
        // Order matters !
        url.searchParams.set('page', page);
        url.searchParams.set('id_serie', manga.id);

        while ( morePages ) {
            request = new Request(url, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json, text/javascript, */*; q=0.01'
                }
            });
            data = await this.fetchJSON(request);
            url.searchParams.set('page', page++);

            if ( data.chapters) {
                chapters.push(...data.chapters.map(chapter => {
                    return {
                        id:  this.getRootRelativeOrAbsoluteLink( chapter.releases[Object.keys(chapter.releases)[0]].link, this.url),
                        title: chapter.chapter_name ? chapter.number.padStart(3, '0')+' - '+chapter.chapter_name: chapter.number.padStart(3, '0')
                    };
                }));
            } else {
                morePages = false;
            }
        }

        return chapters;
    }

    async _getPages(chapter) {
        const online_id = chapter.id.match(/\/(\d+)\//)[1];

        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let chapter_key = await this.fetchRegex(request, /this.page.identifier\s*=\s*(?:"|')\s*(.*)(?:"|');$/gm);
        chapter_key = chapter_key[0];

        request = new Request(new URL('/leitor/pages/'+online_id+'.json?key='+chapter_key, this.url), this.requestOptions);
        const data = await this.fetchJSON(request);

        return data.images;
    }

    async _getMangaFromURI(uri) {
        const online_id = uri.pathname.match(/\d+$/)[0];
        let url = new URL('/series/chapters_list.json', this.url);
        // Order matters !
        url.searchParams.set('page', 1);
        url.searchParams.set('id_serie', online_id);

        const request = new Request(new URL(url.href), this.requestOptions);
        const data = await this.fetchJSON(request);

        return new Manga(
            this,
            data.chapters[0].id_serie,
            data.chapters[0].name
        );
    }

}