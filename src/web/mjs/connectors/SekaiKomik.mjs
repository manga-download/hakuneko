import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class SekaiKomik extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'sekaikomik';
        super.label = 'SekaiKomik';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://www.sekaikomik.club';
        this.path = '/daftar-komik/?list';
    }

    async _initializeConnector() {
        const paths = [ '/', '/manga/' ];
        for(let path of paths) {
            const uri = new URL(path, this.url);
            const request = new Request(uri, this.requestOptions);
            await Engine.Request.fetchUI(request, '', 25000, true);
        }
    }
}