import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaParkEN extends Connector {

    constructor() {
        super();
        super.id = 'mangapark-en';
        super.label = 'MangaPark';
        this.tags = [ 'manga', 'multi-lingual' ];
        this.url = 'https://mangapark.net';
        this.apiURL = `${this.url}/apo/`;

        this.requestOptions.headers.set('x-origin', this.url);
        this.requestOptions.headers.set('x-referer', `${this.url}/`);
        this.requestOptions.headers.set('x-cookie', 'set=h=1;');
    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const queryMangaTitle = /\/title\/\d+/.test(uri.pathname) ? 'main h3 a' : 'meta[property="og:title"]';
        const data = await this.fetchDOM(request, queryMangaTitle);
        const id = uri.pathname.match(/\/(\d+)\/?/)[1];
        const title = (data[0].textContent || data[0].content).trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const gql = `
            query get_content_browse_search($select: ComicSearchSelect) {
                get_content_browse_search(select: $select) {
                    paging {
                        pages
                    }
                    items {
                        data {
                            id, name
                        }
                    }
                }
            }
        `;
        const vars = {
            "select": {
                "word": "",
                "sort": null,
                "page": page,
                "incGenres": [],
                "excGenres": [],
                "origLang": null,
                "oficStatus": null,
                "chapCount": null
            }
        };
        const data = await this.fetchGraphQL(this.apiURL, 'get_content_browse_search', gql, vars);
        if (data.get_content_browse_search.paging.pages < page) {
            return [];
        }
        return data.get_content_browse_search.items.map(manga => {
            return {
                id: manga.data.id,
                title: manga.data.name
            };
        });
    }

    async _getChapters(manga) {
        let chapterList = [];
        const chaptersSources = await this._getChaptersSources(parseInt(manga.id));
        for (const source of chaptersSources) {
            const chapters = await this._getChaptersFromSource(source);
            chapterList.push(...chapters);
        }
        return chapterList
            .sort((a, b) => b.creationDate - a.creationDate)
            .map(chapter => {
                return {
                    id: chapter.id,
                    title: chapter.title,
                    language: chapter.language
                };
            });
    }

    async _getChaptersSources(mangaId) {
        const gql = `
            query get_content_comic_sources($comicId: Int!, $dbStatuss: [String] = [], $userId: Int, $haveChapter: Boolean, $sortFor: String) {
                get_content_comic_sources(comicId: $comicId, dbStatuss: $dbStatuss, userId: $userId, haveChapter: $haveChapter, sortFor: $sortFor) {
                    data {
                        id, lang, srcTitle
                    }
                }
            }
        `;
        const vars = {
            "comicId": mangaId,
            "dbStatuss": ["normal"],
            "haveChapter": true
        };
        const data = await this.fetchGraphQL(this.apiURL, 'get_content_comic_sources', gql, vars);
        return data.get_content_comic_sources.map(source => {
            let language = source.data.lang;
            switch (language) {
                case 'zh_hk':
                    language = 'zh-Hans';
                    break;
                case 'zh_tw':
                    language = 'zh-Hant';
                    break;
                case 'pt_br':
                    language = 'pt-BR';
                    break;
                case 'es_419':
                    language = 'es-419';
                    break;
                case '_t':
                    language = 'other';
                    break;
            }
            return {
                id: source.data.id,
                lang: language,
                srcTitle: source.data.srcTitle
            };
        });
    }

    async _getChaptersFromSource(source) {
        const gql = `
            query get_content_source_chapterList($sourceId: Int!) {
                get_content_source_chapterList(sourceId: $sourceId) {
                    data {
                        id, dateCreate, dname, title, urlPath
                    }
                }
            }
        `;
        const vars = {"sourceId": source.id};
        const data = await this.fetchGraphQL(this.apiURL, 'get_content_source_chapterList', gql, vars);
        return data.get_content_source_chapterList.map(chapter => {
            return {
                id: chapter.data.urlPath,
                title: chapter.data.dname + (chapter.data.title == null || chapter.data.title.length == 0 ? '' : ` - ${chapter.data.title}`) + ` (${source.lang}) [${source.srcTitle}]`,
                language: source.lang,
                creationDate: chapter.data.dateCreate
            };
        });
    }

    async _getPages(chapter) {
        const script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        if(typeof app !== 'undefined' && typeof app.items !== 'undefined') {
                            resolve(app.items.map(item => item.src || item.isrc));
                        } else if (typeof amWord !== 'undefined' && typeof amPass !== 'undefined' && typeof imgHostLis !== 'undefined' && typeof imgPathLis !== 'undefined') {
                            const params = JSON.parse(CryptoJS.AES.decrypt(amWord, amPass).toString(CryptoJS.enc.Utf8));
                            resolve(imgHostLis.map((data, i) => \`\${data}\${imgPathLis[i]}?\${params[i]}\`));
                        } else {
                            const images = __NEXT_DATA__.props.pageProps.dehydratedState.queries
                                .map(query => {
                                    const { httpLis, wordLis } = query.state.data.data.imageSet;
                                    return httpLis.map((path, i) => \`\${path}?\${wordLis[i]}\`);
                                });
                            resolve([].concat(...images));
                        }
                    } catch(error) {
                        reject(error);
                    }
                }, 2500);
            });
        `;
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        return Engine.Request.fetchUI(request, script);
    }
}