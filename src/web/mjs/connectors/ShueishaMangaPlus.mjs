import Publus from './templates/Publus.mjs';
import Manga from '../engine/Manga.mjs';

export default class ShueishaMangaPlus extends Publus {

    constructor() {
        super();
        super.id = 'shueishamangaplus';
        super.label = 'MANGA Plus by Shueisha';
        this.tags = [ 'manga', 'high-quality', 'english', 'spanish' ];
        this.url = 'https://mangaplus.shueisha.co.jp';
        this.apiURL = 'https://jumpg-webapi.tokyo-cdn.com';
        this.protoTypes = '/mjs/connectors/ShueishaMangaPlus.proto';
        this.rootType = 'MangaPlus.Response';
    }

    _getLanguage(language) {
        const languages = {
            0: ['en'], 1: '[es]', 2: '[fr]', 3: '[id]', 4: '[pt-br]', 5: '[ru]', 6: '[th]', 7: '[de]', 8: '[unk]', 9: '[vi]'
        };
        return languages[language] || '[en]';
    }

    async _getMangaFromURI(uri) {
        const id = uri.pathname.match(/\/(\d+)$/)[1];
        uri = new URL('/api/title_detailV3', this.apiURL);
        uri.searchParams.set('title_id', id);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchPROTO(request, this.protoTypes, this.rootType);
        let title = data.success.titleDetailView.title;
        title = `${title.name} ${this._getLanguage(title.language)}`.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        const mangalist = [];
        const request = new Request(new URL('/api/title_list/allV2', this.apiURL), this.requestOptions);
        const data = await this.fetchPROTO(request, this.protoTypes, this.rootType);
        for (const group of data.success.allTitlesViewV2.alltitlegroups) {
            mangalist.push(...group.titles.map(manga => {
                return {
                    id: manga.titleId.toString(),
                    title: `${manga.name} ${this._getLanguage(manga.language)}`.trim(),
                    language: `${this._getLanguage(manga.language)}`
                };
            }));
        }
        return mangalist;
    }

    async _getChapters(manga) {
        let uri = new URL('/api/title_detailV3', this.apiURL);
        uri.searchParams.set('title_id', manga.id);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchPROTO(request, this.protoTypes, this.rootType);
        const result = [];

        for (const chapterListGroup of data.success.titleDetailView.chapterListGroup) {
            const chapters = [
                ...chapterListGroup.firstChapterList || [],
                ...chapterListGroup.midChapterList || [],
                ...chapterListGroup.lastChapterList || []
            ].map(chapter => {
                return {
                    id: chapter.chapterId,
                    title: chapter.subTitle || chapter.name,
                    language: ''
                };
            }).reverse();

            result.push(...chapters);
        }

        return result;

    }

    async _getPages(chapter) {
        let uri = new URL('/api/manga_viewer', this.apiURL);
        uri.searchParams.set('chapter_id', chapter.id);
        uri.searchParams.set('img_quality', 'super_high');
        uri.searchParams.set('split', 'yes');
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchPROTO(request, this.protoTypes, this.rootType);

        try {
            return data.success.mangaViewer.pages
                .filter(page => page.mangaPage)
                .map(page => {
                    let image = page.mangaPage;
                    image = Object.assign(image, {
                        mode: image.encryptionKey ? 'xor' : 'raw',
                        encryption: {
                            pattern: null,
                            key: image.encryptionKey
                        }
                    });
                    return image.mode === 'raw' ? image.imageUrl : this.createConnectorURI(image);
                });
        } catch( error) {
            return [];
        }
    }
}
