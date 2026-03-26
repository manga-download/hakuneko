import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class GanGanOnline extends Connector {

    constructor() {
        super();
        super.id = 'ganganonline';
        super.label = 'ガンガンONLINE (Gangan Online)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://www.ganganonline.com';
    }

    async _getEmbeddedJSON(uri) {
        const request = new Request(uri, this.requestOptions);
        const scripts = await this.fetchDOM(request, 'script#__NEXT_DATA__');
        const data = JSON.parse(scripts[0].text);
        return data.props.pageProps.data;
    }

    async _getMangaFromURI(uri) {
        const data = await this._getEmbeddedJSON(uri);
        return new Manga(this, data.default.titleId, data.default.titleName);
    }

    async _getMangas() {
        let mangaList = [];
        const slugs = [ '/finish', '/rensai' ];
        for(const slug of slugs) {
            const mangas = await this._getMangasFromPage(slug);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPage(path) {
        const uri = new URL(path, this.url);
        const data = await this._getEmbeddedJSON(uri);
        return data.titleSections.reduce((accumulator, section) => {
            const mangas = section.titles.map(title => {
                return {
                    id: title.titleId,
                    title: title.header
                };
            });
            return accumulator.concat(mangas);
        }, []);
    }

    async _getChapters(manga) {
        const uri = new URL('/title/' + manga.id, this.url);
        const data = await this._getEmbeddedJSON(uri);
        return data.default.chapters
            .filter(chapter => {
                if(!chapter.id) {
                    return false;
                }
                if(chapter.status !== undefined && chapter.status < 4) {
                    return false;
                }
                return true;
            })
            .map(chapter => {
                return {
                    id: chapter.id,
                    title: chapter.mainText + (chapter.subText ? ' - ' + chapter.subText : '')
                };
            });
    }

    async _getPages(chapter) {
        const uri = new URL(`/title/${chapter.manga.id}/chapter/${chapter.id}`, this.url);
        const data = await this._getEmbeddedJSON(uri);
        return data.pages.map(page => this.getAbsolutePath((page.image || page.linkImage).imageUrl, uri.href));
    }
}