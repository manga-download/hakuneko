import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class HqNow extends Connector {

    constructor() {
        super();
        super.id = 'hqnow';
        super.label ='Hq-Now';
        this.url = 'https://www.hq-now.com';
        this.tags = ['comics', 'spanish', 'high-quality'];
        this.apiURL = 'https://admin.hq-now.com';
    }

    async _getMangaFromURI(uri) {
        const id = parseInt(uri.pathname.match(/\/hq\/([0-9]+)/)[1]);
        const gql = {
            operationName: 'getHqsById',
            variables: {
                id: id
            },
            query: `query getHqsById($id: Int!) {
                getHqsById(id: $id) {
                    id
                    name
                    synopsis
                    editoraId
                    status
                    publisherName
                    hqCover
                    impressionsCount
                    capitulos {
                        name
                        id
                        number
                    }
                }
            }
            `
        };
        const data = await this.fetchGraphQL(this.apiURL+'/graphql', gql.operationName, gql.query, gql.variables );
        return new Manga(this, id, data[gql.operationName][0].name.trim());
    }

    async _getMangas() {
        const gql = {
            operationName: 'getHqsByNameStartingLetter',
            variables: {
                letter: '0-z'
            },
            query: `query getHqsByNameStartingLetter($letter: String!) {
                getHqsByNameStartingLetter(letter: $letter) {
                    id
                    name
                    editoraId
                    status
                    publisherName
                    impressionsCount
                }
            }
            `
        };
        const data = await this.fetchGraphQL(this.apiURL+'/graphql', gql.operationName, gql.query, gql.variables );
        return data[gql.operationName].map(manga => {
            return {
                id: manga.id,
                title: manga.name.trim()
            };
        });
    }

    async _getChapters(manga) {
        const gql = {
            operationName: 'getHqsById',
            variables: {
                id: manga.id
            },
            query: `query getHqsById($id: Int!) {
                getHqsById(id: $id) {
                    id
                    name
                    synopsis
                    editoraId
                    status
                    publisherName
                    hqCover
                    impressionsCount
                    capitulos {
                        name
                        id
                        number
                    }
                }
            }
            `
        };
        const data = await this.fetchGraphQL(this.apiURL+'/graphql', gql.operationName, gql.query, gql.variables );
        return data[gql.operationName][0].capitulos.map(chapter => {
            return {
                id: chapter.id,
                title: chapter.name ? chapter.number + ' : '+chapter.name.trim() : chapter.number,
            };
        }).reverse();
    }

    async _getPages(chapter) {
        const gql = {
            operationName: 'getChapterById',
            variables: {
                chapterId: chapter.id
            },
            query: `query getChapterById($chapterId: Int!) {
                getChapterById(chapterId: $chapterId) {
                    name
                    number
                    oneshot
                    pictures {
                        pictureUrl
                    }
                    hq {
                        id
                        name
                        capitulos {
                            id
                            number
                        }
                    }
                }
            }
            `
        };
        const data = await this.fetchGraphQL(this.apiURL+'/graphql', gql.operationName, gql.query, gql.variables );
        return data[gql.operationName].pictures.map(picture => this.getRootRelativeOrAbsoluteLink(picture.pictureUrl, this.url));
    }
}
