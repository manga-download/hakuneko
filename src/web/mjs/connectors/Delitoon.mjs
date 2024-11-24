import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class Delitoon extends Connector {
    constructor() {
        super();
        super.id = 'delitoon';
        super.label = 'Delitoon';
        this.tags = [ 'webtoon', 'french' ];
        this.url = 'https://www.delitoon.com';
        this.links = {
            login: 'https://www.delitoon.com/user/login'
        };
        this.requestOptions.headers.set('x-balcony-id', 'DELITOON_COM');
        this.requestOptions.headers.set('x-balcony-timeZone', 'Europe/Paris');
        this.requestOptions.headers.set('x-platform', 'WEB');
        this.requestOptions.headers.set('x-referer', this.url);
    }
    async _getMangaFromURI(uri) {
        await this.getToken();
        const mangaid = uri.href.match(/\/detail\/(\S+)/)[1];
        const req = new URL('/api/balcony-api-v2/contents/'+mangaid, this.url);
        req.searchParams.set('isNotLoginAdult', 'true');
        const request = new Request(req, this.requestOptions);
        const data = await this.fetchJSON(request);
        return new Manga(this, mangaid, data.data.title.trim());
    }
    async _getMangas() {
        await this.getToken();
        const uri = new URL('/api/balcony-api-v2/contents/search', this.url);
        uri.searchParams.set('searchText', '');
        uri.searchParams.set('isCheckDevice', 'true');
        uri.searchParams.set('isIncludeAdult', 'true');
        uri.searchParams.set('contentsThumbnailType', 'MAIN');
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.data.map(element => {
            return {
                id : element.alias,
                title : element.title.trim()
            };
        });
    }
    async _getChapters(manga) {
        await this.getToken();
        const uri = new URL('/api/balcony-api-v2/contents/'+manga.id, this.url);
        uri.searchParams.set('isNotLoginAdult', 'true');
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.data.episodes.map(element => {
            let title = '';
            try{
                let chapnum = parseInt(element.title);
                !isNaN(chapnum) ? title = 'Chapter '+ chapnum : title = element.title.trim();
            } catch (error) {
                title = element.title.trim();
            }
            title += element.subTitle ? ' : ' + element.subTitle.trim() : '';
            return {
                id : element.alias,
                title : title,
            };
        }).reverse();
    }
    async _getPages(chapter) {
        await this.getToken();
        const uri = new URL('/api/balcony-api-v2/contents/'+chapter.manga.id+'/'+chapter.id, this.url);
        uri.searchParams.set('isNotLoginAdult', 'true');
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        if (data.result == 'ERROR') {
            switch (data.error.code) {
                case 'NOT_LOGIN_USER':
                    throw new Error('You must be logged to view this chapter !');
                case 'UNAUTHORIZED_CONTENTS':
                    throw new Error('You must unlock this chapter first !');
                default:
                    throw new Error('Unknown error : '+ data.error.code);
            }
        }
        return data.data.images.map(element => this.createConnectorURI(element.imagePath));
    }

    async getToken() {
        const uri = new URL('/api/auth/session', this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request);
        if(data.user) {
            this.requestOptions.headers.set('authorization', ' Bearer '+ data.user.accessToken.token);
        } else {
            this.requestOptions.headers.delete('authorization');
        }
    }
}
