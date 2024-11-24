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
        this.requestOptions.headers.set('x-cookie', 'nsfw=2;');

        this.languages = {
            'zh_hk': 'zh-Hans',
            'zh_tw': 'zh-Hant',
            'pt_br': 'pt-BR',
            'es_419': 'es-419',
            '_t': 'other'
        };

    }

    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const queryMangaTitle = /\/title\/\d+/.test(uri.pathname) ? 'main h3 a' : 'meta[property="og:title"]';
        const data = await this.fetchDOM(request, queryMangaTitle);
        const id = parseInt(uri.pathname.match(/\/(\d+)\/?/)[1]);
        const title = (data[0].textContent || data[0].content).trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        try {
            const mangaList = await this._getMangasV5();
            if (mangaList.length == 0) {
                throw new Error('Got 0 mangas from site using v5 version! Using v3 version as a fallback!');
            }
            return mangaList;
        } catch (error) {
            return await this._getMangasV3();
        }
    }

    async _getMangasV3() {
        let mangaList = [];
        const uri = new URL('/browse?sort=name', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'nav.d-md-block ul.pagination li:nth-last-child(2) a');
        const pageCount = parseInt(data[0].text.trim());
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPageV3(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

    async _getMangasFromPageV3(page) {
        const uri = new URL(`/browse?sort=name&page=${page}`, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, '#subject-list div.item a.fw-bold');
        return data.map( element => {
            this.cfMailDecrypt(element);
            return {
                id: parseInt(this.getRootRelativeOrAbsoluteLink(element, request.url).match(/\/(\d+)\/?/)[1]),
                title: element.text.trim()
            };
        });
    }

    async _getMangasV5() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPageV5(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPageV5(page) {
        const gql = `
            query get_searchComic($select: SearchComic_Select) {
                get_searchComic(select: $select) {
                    paging {
                        pages
                    }
                    items {
                        data {
                            id
                            name
                            tranLang
                        }
                    }
                }
            }
        `;
        const vars = {
            "select": {
                "word": "",
                "page": page,
                "incGenres": [],
                "excGenres": [],
            }
        };
        const data = await this.fetchGraphQL(this.apiURL, 'get_searchComic', gql, vars);
        if (data.get_searchComic.paging.pages < page) {
            return [];
        }
        return data.get_searchComic.items.map(manga => {
            return {
                id: manga.data.id,
                title: [manga.data.name, `[${manga.data.tranLang}]`].join(' '),
                language: manga.data.tranLang
            };
        });
    }

    async _getChapters(manga) {
        try {
            const chapterList = await this._getChaptersV5(manga);
            if (chapterList.length == 0) {
                throw new Error('Got 0 chapters from site using v5 version! Using v3 version as a fallback!');
            }
            return chapterList;
        } catch (error) {
            return await this._getChaptersV3(manga);
        }
    }

    async _getChaptersV3(manga) {
        let chapterList = [];
        const uri = new URL('/ajax.reader.subject.episodes.by.latest', this.url);
        for (let page = '', run = true; run;) {
            const request = new Request(uri, {
                method: 'POST',
                body: JSON.stringify({
                    iid: manga.id,
                    prevPos: page
                }),
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8'
                }
            });
            const data = await this.fetchJSON(request);
            const chapters = [...this.createDOM(data.html).querySelectorAll('div.episode-item > div > a.chapt')].map(element => {
                const link = this.getRootRelativeOrAbsoluteLink(element, this.url);
                let lang = link.match(/c[\d.]+-(\w+)-i\d+/)[1];
                lang = this.languages[lang] || lang;
                return {
                    id: link,
                    title: element.text.trim().replace(/\s+/g, ' ') + ` (${lang})`,
                    language: lang
                };
            }).filter(chapter => chapter.language);
            chapterList.push(...chapters);
            run = data.isLast != null ? !data.isLast : false;
            page = data.lastPos;
        }
        return chapterList;
    }

    async _getChaptersV5(manga) {
        const gql = `
            query Get_comicChapterList($comicId: ID!) {
                get_comicChapterList(comicId: $comicId) {
                    data {
                    	  id, dateCreate, dname, title
                    }
                } 
            }
        `;

        const vars = {
            "comicId": manga.id.toString()
        };

        const data = await this.fetchGraphQL(this.apiURL, 'Get_comicChapterList', gql, vars);
        return data.get_comicChapterList
            .sort((a, b) => b.dateCreate - a.dateCreate)
            .map(chapter => {
                return {
                    id: chapter.data.id,
                    title: chapter.data.dname + (chapter.data.title == null || chapter.data.title.length == 0 ? '' : ` - ${chapter.data.title}`),
                    language: manga.language
                };
            });
    }
    async _getPages(chapter) {
        try {
            const pagelist = await this._getPagesV5(chapter);
            if (pagelist.length == 0) {
                throw new Error('Got 0 pages from site using v5 version! Using v3 version as a fallback!');
            }
            return pagelist;
        } catch (error) {
            return await this._getPagesV3(chapter);
        }
    }

    async _getPagesV3(chapter) {
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

    async _getPagesV5(chapter) {
        const gql = `
            query Get_chapterNode($getChapterNodeId: ID!) {
                get_chapterNode(id: $getChapterNodeId) {
                    data {
                        imageFile {
                            urlList
                        }
                    }
                }
            }
        `;

        const vars = {
            "getChapterNodeId": chapter.id.toString()
        };

        const data = await this.fetchGraphQL(this.apiURL, 'Get_chapterNode', gql, vars);
        return data.get_chapterNode.data.imageFile.urlList;

    }
}
