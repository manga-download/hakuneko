import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class NetComics extends Connector {
    constructor() {
        super();
        super.id = 'netcomics';
        super.label = 'NetComics';
        this.tags = ['webtoon', 'english'];
        this.url = 'https://www.netcomics.com';
        this.api = 'https://beta-api.netcomics.com';
        this.requestOptions.headers.set('x-origin', this.url);
        this.requestOptions.headers.set('x-referer', this.url);
        this.links = {
            login: 'https://netcomics.com/login'
        };
    }

    async _getMangaFromURI(uri) {
        const slug = uri.pathname.split('/').pop();
        const request = new Request(new URL('/api/v1/title/comic/'+slug, this.api), this.requestOptions);
        const data = await this.fetchJSON(request);
        const id = '/'+data.data.site+'/comic/'+data.data.title_id;
        return new Manga(this, id, data.data.title_name);
    }

    async _getMangas() {
        let mangaList = [];
        for (let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }
    async _getMangasFromPage(page) {
        let request = new Request(new URL(`/api/v1/title/genre?no=${page}&size=18&genre=`, this.api), {
            method: 'GET',
            headers: {
                'x-referer': this.url,
                'x-origin' : this.url,
                'platform' : 'web',
                'site' : 'EN',
                'adult' : 'Y',
                'did': Date.now()
            }
        }
        );
        let data = await this.fetchJSON(request);
        return data.data.map(manga => {
            return {
                id: '/'+manga.site+'/comic/'+manga.title_id,
                title: manga.title_name
            };
        });
    }
    async _getChapters(manga) {
        const mangaid = manga.id.match(/\/comic\/([0-9]+)/)[1];
        const request = new Request(new URL(`/api/v1/chapter/order/${mangaid}/rent`, this.api), this.requestOptions);
        const data = await this.fetchJSON(request);
        return data.data.map(chapter => {
            let title = 'Chapter '+ chapter.chapter_no+ ' ';
            title += chapter.chapter_name.trim();
            return {
                id : '/viewer/'+mangaid+'/'+ chapter.chapter_id,
                title: title
            };
        }).reverse();
    }

    async _getPages(chapter) {
        //check if user is logged, otherwise nothing will work
        let request = new Request(this.url, this.requestOptions);
        const ncxuserdata = await Engine.Request.fetchUI(request, 'localStorage.getItem("ncx.user.data") || ""');
        if (ncxuserdata == '') {
            throw Error('To see this chapter, please login to the website using Manual Interaction !');
        }
        try{
            const mangaid = chapter.id.match(/\/viewer\/([\S]+)\//)[1];
            const chapterid = chapter.id.match(/\/([0-9]+)$/)[1];
            let request = new Request(new URL('/api/v1/chapter/viewer/625/${mangaid}/${chapterid}?otp=', this.api), this.requestOptions);
            let data = await this.fetchJSON(request);
            //the fetch request should return error 500 if you dont have acces to the chapter
            //hence the use of try catch
            return data.data.images.map(image => {
                let uri = new URL(image.image_url, request.url);
                return this.createConnectorURI(uri.href);
            });
        } catch(e) {
            throw Error('You are not logged or chapter not purchased !');
        }
    }
}
