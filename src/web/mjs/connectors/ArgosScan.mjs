import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class ArgosScan extends Connector {
    constructor() {
        super();
        super.id = 'argosscan';
        super.label = 'Argos Scan';
        this.tags = [ 'manga', 'high-quality', 'portuguese', 'scanlation' ];
        this.url = 'https://argosscan.com';
        this.apiURL = `${this.url}/graphql`;
        this.links = {
            login: 'https://argosscan.com/login'
        };

        this.requestOptions.headers.set('x-origin', this.url);
        this.requestOptions.headers.set('x-referer', `${this.url}/`);
    }

    async _getMangaFromURI(uri) {
        const id = parseInt(uri.pathname.match(/obras\/(\d+)\//i)[1]);
        const gql = `
            query project($id: Int!) {
                project(id: $id) {
                    name
                }
            }
        `;
        const vars = {"id": id};
        const data = await this.fetchGraphQL(this.apiURL, 'project', gql, vars);
        const title = data.project.name;
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
        const gql = `
            query latestProjects($filters: FiltersExpression!, $orders: OrdersExpression!, $pagination: PaginationInput) {
                getProjects(orders: $orders, filters: $filters, pagination: $pagination) {
                    projects {
                        id, name
                    } 
                }
            }
        `;
        const vars = {
            "filters": {
                "operator": "AND",
                "childExpressions": [{
                    "operator": "AND",
                    "filters": [{
                        "op": "GE",
                        "field": "Project.id",
                        "values": ["1"]
                    }]
                }]
            },
            "orders": {
                "orders": [{
                    "or": "ASC",
                    "field": "Project.name"
                }]
            },
            "pagination": {
                "limit": 100,
                "page": page
            }
        };
        const data = await this.fetchGraphQL(this.apiURL, 'latestProjects', gql, vars);
        return data.getProjects.projects.map(manga => {
            return {
                id: manga.id,
                title: manga.name
            };
        });
    }

    async _getChapters(manga) {
        const gql = `
            query project($id: Int!) {
                project(id: $id) {
                    getChapters(order: {number: DESC}) {
                        id, number, title
                    }
                }
            }
        `;
        const vars = {"id": manga.id};
        const data = await this.fetchGraphQL(this.apiURL, 'project', gql, vars);
        return data.project.getChapters.map(chapter => {
            const title = `Ch. ${chapter.number} - ${chapter.title}`;
            return {
                id: chapter.id,
                title: title.trim(),
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        const gql = `
            query getChapter($filters: FiltersExpression!, $orders: OrdersExpression!) {
                getChapters(orders: $orders, filters: $filters) {
                    chapters {
                        images
                    }
                }
            }
        `;
        const vars = {
            "filters": {
                "operator": "AND",
                "filters": [{
                    "op": "EQ",
                    "field": "Chapter.id",
                    "values": [chapter.id]
                }],
                "childExpressions": {
                    "operator": "AND",
                    "filters": {
                        "op": "GE",
                        "field": "Project.id",
                        "relationField": "Chapter.project",
                        "values": ["1"]
                    }
                }
            },
            "orders": {
                "orders": {
                    "or": "ASC",
                    "field": "Chapter.id"
                }
            }
        };
        const data = await this.fetchGraphQL(this.apiURL, 'getChapter', gql, vars);
        return data.getChapters.chapters[0].images.map(image => {
            return this.createConnectorURI(new URL(`images/${chapter.manga.id}/${image}`, this.url));
        });
    }

    async _handleConnectorURI(payload) {
        const request = new Request(payload, this.requestOptions);
        request.headers.set('x-sec-fetch-dest', 'image');
        request.headers.set('x-sec-fetch-mode', 'no-cors');
        request.headers.delete('x-origin');
        const response = await fetch(request);
        let data = await response.blob();
        data = await this._blobToBuffer(data);
        this._applyRealMime(data);
        return data;
    }
}