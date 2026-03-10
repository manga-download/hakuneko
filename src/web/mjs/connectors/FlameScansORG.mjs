import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class FlameScansORG extends Connector {
    constructor() {
        super();
        super.id = 'flamescans-org';
        super.label = 'Flame Comics';
        this.tags = ['manga', 'webtoon', 'english'];
        this.url = 'https://flamecomics.xyz';
        this.path = '/browse';
    }

    async _getMangas() {
        const uri = new URL(this.path, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '#__NEXT_DATA__');
        const json = JSON.parse(data[0].textContent);

        return json.props.pageProps.series
            .filter(manga => manga.series_id) 
            .map(manga => {
                return {
                    id: `/series/${manga.series_id}`,
                    title: manga.title.trim()
                };
            });
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '#__NEXT_DATA__');
        const json = JSON.parse(data[0].textContent);
        
        return new Manga(this, uri.pathname, json.props.pageProps.series.title.trim());
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '#__NEXT_DATA__');
        const json = JSON.parse(data[0].textContent);

        return json.props.pageProps.chapters.map(chapter => {
            const title = chapter.title ? `Chapter ${chapter.chapter} - ${chapter.title}` : `Chapter ${chapter.chapter}`;
            return {
                id: `/series/${chapter.series_id}/${chapter.token}`,
                title: title.trim()
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '#__NEXT_DATA__');
        const json = JSON.parse(data[0].textContent);
        const chapterData = json.props.pageProps.chapter;
        
        return Object.values(chapterData.images).map(image => {
            return `https://cdn.flamecomics.xyz/uploads/images/series/${chapterData.series_id}/${chapterData.token}/${image.name}`;
        });
    }
}
