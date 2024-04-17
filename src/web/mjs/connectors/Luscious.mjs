import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Luscious extends Connector {

    constructor() {
        super();
        super.id = 'luscious';
        super.label = 'Luscious';
        this.tags = [ 'hentai', 'multi-lingual' ];
        this.url = 'https://www.luscious.net';
        this.apiURL = 'https://apicdn.luscious.net/graphql/nobatch/';
    }

    async _getMangaFromURI(uri) {
        const id = uri.pathname.match(/_(\d+)\/?$/)[1];
        const request = new Request(uri);
        const name = (await this.fetchDOM(request, 'main h1.album-heading')).pop().textContent.trim();
        return new Manga(this, id, name);
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const url = new URL(this.apiURL);
        url.searchParams.set('operationName', 'AlbumList');
        const query = `
            query AlbumList($input: AlbumListInput!) {
                album {
                    list(input: $input) {
                        items {
                            id
                            title
                            slug
                            language {
                                id
                                title
                                url
                            }
                        }
                    }
                }
            }
        `;
        url.searchParams.set('query', query);
        const variables = {
            input: {
                display: 'date_trending',
                filters: [{ name: 'album_type', value: 'manga' }, { name: 'restrict_genres', value: 'loose' }],
                page: page,
                items_per_page: 30//dont change items_per_page to more than 30
            }
        };

        url.searchParams.set('variables', JSON.stringify(variables));
        const request = new Request(url, {
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json',
            },
        });

        const data = await this.fetchJSON(request);
        return data.data.album.list.items.map(manga => {
            return {
                id: manga.id,
                title: manga.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        return [ {
            id: manga.id,
            title: manga.title,
            language: ''
        } ];
    }

    async _getPages(chapter) {
        const pagelist = [];
        for (let page = 1, run = true; run; page++) {
            const pagesResults = await this._getPagesFromChapterPage(page, chapter);
            if (pagesResults.data.picture.list.items.length > 0) {
                pagesResults.data.picture.list.items.forEach(element => pagelist.push(element.url_to_original));
            }
            run = pagesResults.data.picture.list.info.has_next_page;
        }
        return pagelist;
    }

    async _getPagesFromChapterPage(page, chapter) {
        const url = new URL(this.apiURL);
        url.searchParams.set('operationName', 'AlbumListOwnPictures');
        const query = `
                query AlbumListOwnPictures($input: PictureListInput!) {
                  picture {
                    list(input: $input) {
                      info {
                        has_next_page
                      }
                      items {
                        url_to_original
                      }
                    }
                  }
                }
        `;
        url.searchParams.set('query', query);
        const variables = {
            input: {
                filters: [{ name: 'album_id', value: chapter.id }],
                display: 'position',
                items_per_page: 50, //dont change items_per_page to more than 50
                page: page
            }
        };
        url.searchParams.set('variables', JSON.stringify(variables));
        const request = new Request(url, {
            headers: {
                'Accept': '*/*',
                'Content-Type': 'application/json',
            },
        });
        return this.fetchJSON(request);
    }
}
