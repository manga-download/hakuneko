import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Luscious extends Connector {

    constructor() {
        super();
        super.id = 'luscious';
        super.label = 'Luscious';
        this.tags = [ 'hentai', 'multi-lingual' ];
        this.url = 'https://www.luscious.net';
        this.apiURL = 'https://api.luscious.net/graphql/nobatch/';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, 'head title');
        let id = uri.pathname;
        let title = data[0].textContent.split('|')[0].trim() + ` [${data[0].lang}]`;
        return new Manga(this, id, title);
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
        let gql = `{
            album {
                list(input: { display: date_newest, page: ${page} }) {
                    items { url, title }
                }
            }
        }`;
        let data = await this.fetchGraphQL(this.apiURL, undefined, gql, undefined);
        return data.album.list.items.map(item => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(item.url, this.url),
                title: item.title.trim()
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
        const query = `
            query AlbumListOwnPictures($input: PictureListInput!) {
                picture {
                    list(input: $input) {
                        items {
                            url_to_original
                        }
                    }
                }
            }
        `;
        const variables = {
            input: {
                filters: [
                    {
                        name: 'album_id',
                        value: chapter.id.match(/_(\d+)\/?$/)[1]
                    }
                ],
                display : 'date_newest',
                page: 0
            }
        };
        let pageList = [];
        for(let page = 1, run = true; run; page++) {
            variables.input.page = page;
            const data = await this.fetchGraphQL(this.apiURL, 'AlbumListOwnPictures', query, variables);
            const pages = data.picture.list.items.map(item => item.url_to_original);
            pages.length > 0 ? pageList.push(...pages) : run = false;
        }
        return pageList;
    }
}
