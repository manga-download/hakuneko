import GManga from './GManga.mjs';

export default class MangaTales extends GManga {

    constructor() {
        super();
        super.id = 'mangatales';
        super.label = 'MangaTales';
        this.tags = ['manga', 'webtoon', 'arabic'];
        this.url = 'https://mangatales.com';
        this.apiurl = this.url;
    }

    async _getChapters(manga) {
        function getMangaSlug(/*mangaTitle*/) {
            // NOTE: As of today, the manga slug (e.g. 'how-to-fight') can be any arbitrary string
            return 'manga-slug'; // mangaTitle.replace(/\s+/g, '-').replace(/[^-\w]+/gi, '').toLowerCase();
        }
        let request = new Request(new URL(`/api/mangas/${manga.id}`, this.apiurl), this.requestOptions);
        let data = await this.fetchJSON(request);
        data = data['iv'] ? this._haqiqa(data.data) : data;
        data = data['isCompact'] ? this._unpack(data) : data;
        return data.mangaReleases.map(chapter => {
            const team = chapter.teams.find(t => t.id === chapter.team_id);
            let title = 'Vol.' + chapter.volume + ' Ch.' + chapter.chapter;
            title += chapter.title ? ' - ' + chapter.title : '';
            title += team.name ? ' [' + team.name + ']' : '';
            return {
                id: [manga.id, getMangaSlug(manga.title), chapter.chapter, team.name].join('/'),
                title: title,
                language: ''
            };
        });
    }
    async _getPages(chapter) {
        let request = new Request(new URL('/mangas/' + chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'script[data-component-name="HomeApp"]');
        data = JSON.parse(data[0].textContent);
        let url = (data.globals.wla.configs.http_media_server || data.globals.wla.configs.media_server) + '/uploads/releases/';
        data = data.readerDataAction.readerData.release;
        let images = [];
        if (data.hq_pages && data.hq_pages.length > 0) {
            images = data.hq_pages.split('\r\n');
        } else if (data.mq_pages && data.mq_pages.length > 0) {
            images = data.mq_pages.split('\r\n');
        } else if (data.lq_pages && data.lq_pages.length > 0) {
            images = data.lq_pages.split('\r\n');
        }
        return images.map(image => {
            let uri = new URL(url, request.url);
            uri.pathname += image;
            return this.createConnectorURI(uri.href);
        });
    }
}
