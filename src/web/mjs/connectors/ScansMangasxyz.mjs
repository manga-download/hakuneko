import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class ScansMangasxyz extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'scansmangasxyz';
        super.label = 'ScansMangas (XYZ)';
        this.tags = [ 'manga', 'french' ];
        this.url = 'https://scansmangas.xyz';
        this.path = '/tous-nos-mangas/';

        this.queryMangas = 'div.bigor > a';
        this.queryChapters = 'span.lchx.desktop > a';
        this.queryChaptersTitle = undefined;
        this.queryPages = 'div#readerarea img[src]:not([src=""])';
        this.queryPagesScript = `
            new Promise((resolve, reject) => {
                let pagelist = []
                try{
                    for (let i = 1; i <= parseInt(document.querySelector('div.nav_apb > a:nth-last-of-type(2)').text); i++) {
                        pagelist.push(document.querySelector('a[rel=nofollow] > img').src.replace(/(\\d+)(\\.)/,i+'$2'))
                    }
                    resolve(pagelist)
                }catch(error) {
                    reject(error)
                }
            });
        `;
    }
}