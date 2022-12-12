import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ScyllaScans extends Connector {

    constructor() {
        super();
        super.id = 'scyllascans';
        super.label = 'Scylla Scans';
        this.tags = [ 'manga', 'webtoon', 'english', 'scanlation' ];
        this.url = 'https://scyllascans.org';
        this.apiUrl = 'https://api.scyllascans.org';
        this.requestOptions.headers.set('accept', '*/*');
    }

    async _getMangas() {
        const operationName = 'works';
        const query = 'query works($orderBy: String, $sortBy: String, $first: Int, $offset: Int, $languages: [Int], $showHidden: Boolean) {\n  works(orderBy: $orderBy, sortBy: $sortBy, first: $first, offset: $offset, languages: $languages, showHidden: $showHidden) {\n    name\n    language_name\n    stub\n  }\n}';
        const variables = {
            "orderBy": "asc",
            "sortBy": "id",
            "first": 1000,
            "offset": 0,
            "languages": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            "showHidden": true
        };

        const data = await this.fetchGraphQL(new URL('/graphql', this.apiUrl), operationName, query, variables);
        return data.works.map(work => ({
            id: work.stub,
            title: work.name
        }));
    }

    async _getChapters(manga) {
        const workStub = manga.id;
        const operationName = 'chaptersByWork';
        const query = 'query chaptersByWork($workStub: String, $languages: [Int], $showHidden: Boolean) {\n  chaptersByWork(workStub: $workStub, languages: $languages, showHidden: $showHidden) {\n      volume\n      chapter\n      subchapter\n      read_path\n    \tlanguage_name\n  }\n}';
        const variables = {
            workStub,
            languages: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            showHidden: true
        };
        const data = await this.fetchGraphQL(new URL('/graphql', this.apiUrl), operationName, query, variables);
        return data.chaptersByWork.map((chapter) => ({
            id: chapter.read_path,
            title: this._generateChapterTitle(chapter),
            language: chapter.language_name
        }));
    }

    async _getPages(chapter) {
        var chapParts = chapter.id.split('/');
        var workStub = chapParts[2];
        var language = this._generateLanguageIdFromLanguageName(chapParts[3]);
        var volume = parseInt(chapParts[4]);
        var [chap, subchapter] = chapParts[5].split('.').map(x => parseInt(x));
        const operationName = 'chapterByWorkAndChapter';
        const query = 'query chapterByWorkAndChapter($workStub: String, $language: Int, $volume: Int, $chapter: Int, $subchapter: Int, $showHidden: Boolean) {\n  chapterByWorkAndChapter(workStub: $workStub, language: $language, volume: $volume, chapter: $chapter, subchapter: $subchapter, showHidden: $showHidden) {\n  \tuniqid\n    work { \n      uniqid\n    }\n    pages {\n      filename\n    }\n  }\n}';
        const variables = {
            workStub,
            language,
            volume,
            chapter: chap,
            subchapter,
            showHidden: true
        };
        const { chapterByWorkAndChapter: cha } = await this.fetchGraphQL(new URL('/graphql', this.apiUrl), operationName, query, variables);
        const startUrl = `${this.apiUrl}/works/${cha.work.uniqid}/${cha.uniqid}`;
        return cha.pages.map((page) => `${startUrl}/${page.filename}`);
    }

    _generateChapterTitle(chapterValues) {
        let title = '';
        if(chapterValues.volume != 0) {
            title += `Volume ${chapterValues.volume} `;
        }
        title += `Chapter ${chapterValues.chapter}`;
        if(chapterValues.subchapter != 0) {
            title += `.${chapterValues.subchapter}`;
        }
        return title;
    }

    _generateLanguageIdFromLanguageName(languageName) {
        const languageIds = {
            "en": 2
        };
        return languageIds[languageName];
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'h4.display-5');
        const id = uri.pathname.split('/').pop();
        const title = data[0].textContent.trim();
        return new Manga(this, id, title);
    }
}
