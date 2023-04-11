import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class NetComics extends Connector {
    constructor() {
        super();
        super.id = 'netcomics';
        super.label = 'NetComics';
        this.tags = ['webtoon', 'multi-lingual'];
        this.url = 'https://www.netcomics.com';
        this.api = 'https://beta-api.netcomics.com';
        this.requestOptions.headers.set('x-origin', this.url);
        this.requestOptions.headers.set('x-referer', this.url);
        this.links = {
            login: 'https://netcomics.com/login'
        };
        this.config = {
            language: {
                label: 'Language Settings',
                description: 'Choose the language to use. This will affect available manga lists',
                input: 'select',
                options: [
                    { value: 'EN', name: 'English' },
                    { value: 'JA', name: 'Japanese' },
                    { value: 'CN', name: 'Chinese' },
                    { value: 'KO', name: 'Korean' },
                    { value: 'ES', name: 'Spanish' },
                    { value: 'FR', name: 'French' },
                    { value: 'DE', name: 'German' },
                    { value: 'ID', name: 'Indonesian' },
                    { value: 'TH', name: 'Thai' },
                    { value: 'VI', name: 'Vietnamese' },
                ],
                value: 'EN'
            },
        };
    }

    async _getMangaFromURI(uri) {
        const site = uri.match(/\/([a-z]{2})\/comic\//)[1].toUpperCase();
        const slug = uri.match(/\/comic\/(\S+)/)[1];
        const request = new Request(new URL(`/api/v1/title/comic/${slug}/${site}`, this.api), {
            method: 'GET',
            headers: {
                'x-referer': this.url,
                'x-origin' : this.url,
                'platform' : 'web',
                'site' : site,
                'adult' : 'Y',
                'did': Date.now()
            }
        });

        const data = await this.fetchJSON(request);
        const id = '/'+data.data.site.toLowerCase()+'/comic/'+data.data.title_id;
        return new Manga(this, id, data.title_name);
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
                'site' : this.config.language.value,
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
        //api/v1/chapter/order/17451/rent
        const mangaid = manga.id.match(/\/comic\/([0-9]+)/)[1];
        let request = new Request(new URL(`/api/v1/chapter/order/${mangaid}/rent`, this.api), this.requestOptions);
        let data = await this.fetchJSON(request);
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
        try{
            const mangaid = chapter.id.match(/\/viewer\/([\S]+)\//)[1];
            const chapterid = chapter.id.match(/\/([0-9]+)$/)[1];
            let request = new Request(new URL(`/api/v1/chapter/viewer/625/${mangaid}/${chapterid}?otp=`, this.api), this.requestOptions);
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
