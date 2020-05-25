import Connector from '../engine/Connector.mjs';
// import Manga from '../engine/Manga.mjs';

export default class Sukima extends Connector {

    constructor() {
        super();
        super.id = 'sukima';
        super.label = 'Sukima';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://www.sukima.me';
        this.language = 'japanese';
        this.requestOptions.headers.set( 'x-referer', this.url );
    }

    async _getMangas() {
        let request = new Request(new URL('/api/book/v1/free/', this.url), {
            method: 'POST',
            body: '{"store":false,"genre":"0"}',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            }
        });
        let categorys = await this.fetchJSON(request);

        let uri;
        let pages;
        let mangas = [];
        for (const category of categorys.rows) {
            console.log('Process category:', category.more_btn.text.replace('無料の','').replace('ー漫画をもっと見る',''));
            if (category.more_btn.link.startsWith('/book/search/')) {
                uri = new URL(category.more_btn.link, this.url);
                pages = 1;
                for (let page = 1; page <= pages; page++) {
                    request = new Request(new URL('/api/v1/search/', this.url), {
                        method: 'POST',
                        body: '{"free":["1","2"],"page":'+page+',"sort_by":"0","tag":["'+uri.searchParams.get('tag')+'"]}',
                        headers: {
                            'Content-Type': 'application/json;charset=utf-8',
                        }
                    });

                    let pageContent = await this.fetchJSON(request);
                    pages = pageContent.max_page;
                    console.log('Page', page+'/'+pages);

                    for (const manga of pageContent.items) {
                        mangas.push(
                            {
                                id: '/api/book/v1/title/'+manga.title_code+'/',
                                title: manga.title_name
                            }
                        );
                    }
                }
            }
        }

        return mangas;
    }

}