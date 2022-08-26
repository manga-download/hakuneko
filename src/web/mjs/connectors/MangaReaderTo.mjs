import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class MangaReaderTo extends Connector {

    constructor() {
        super();
        super.id = 'mangareaderto';
        super.label = 'MangaReader.to';
        this.tags = ['manga', 'webtoon', 'japanese', 'korean', 'english', 'chinese', 'french'];
        this.url = 'https://mangareader.to';
        this.path = '/az-list?page=';

        this.queryMangaTitleFromURI = 'div#ani_detail div.anisc-detail h2.manga-name';
        this.queryMangas = '#main-content div.manga-detail h3 a';
        this.queryChapters = 'div.chapters-list-ul ul li a, div.volume-list-ul div.manga-poster';
        this.queryPages = 'div#wrapper';
    }

    async _getMangaFromURI(uri) {
        const request = new Request(new URL(uri), this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangaTitleFromURI);

        const id = uri.pathname;
        const title = data[0].textContent.trim();

        return new Manga(this, id, title);
    }

    async _getMangas() {
        const mangaList = [];
        for(let page = 1, run = true; run; page++) {
            const mangas = await this._getMangasFromPage(page);
            mangas.length ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        const uri = new URL(this.path + page, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryMangas);
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        let uri = new URL(manga.id, this.url);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchDOM(request, this.queryChapters);
        return data.map(element => {
            const link = this.getRootRelativeOrAbsoluteLink(element.tagName.toLowerCase() === 'a' ? element : element.querySelector('a'), this.url);
            const title = element.tagName.toLowerCase() === 'a' ? element.title.replace(/([^:]*):(.*)/, (match, g1, g2) => g1.trim().toLowerCase() === g2.trim().toLowerCase() ? g1 : match).trim() : element.textContent.trim();
            const lang = link.match(/(\/en\/)|(\/ja\/)|(\/ko\/)|(\/zh\/)|(\/fr\/)/gi);
            const language = lang ? lang[0].replace(/\//gm, '').toUpperCase() : '';
            return {
                id: link,
                title: title.replace(manga.title, '').trim() + ` (${language})` || manga.title,
                language
            };
        });
    }

    async _getPages(chapter) {
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, this.queryPages);
        const readingId = data[0].dataset.readingId;

        return this._getImages(request, readingId);
    }

    async _getImages(requestChapter, readingId) {
        // https://mangareader.to/ajax/image/list/chap/545260?mode=vertical&quality=high&hozPageSize=1
        // https://mangareader.to/ajax/image/list/vol/26758?mode=vertical&quality=high&hozPageSize=1
        const uri = new URL(`ajax/image/list/${requestChapter.url.includes('chapter') ? 'chap' : 'vol'}/${readingId}`, this.url);
        uri.searchParams.set('quality', 'high');
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchJSON(request, 3);

        const dom = this.createDOM(data.html);
        const imagesArr = Array.from(dom.querySelectorAll('.iv-card'));
        const shuffledImagesArr = imagesArr.filter(image => image.className.includes('shuffled'));

        if(!imagesArr.length || !shuffledImagesArr.length)
            return imagesArr.map(image => image.dataset.url);

        // Example: https://c-1.mreadercdn.ru/_v2/1/0dcb8f9eaacfd940603bd75c7c152919c72e45517dcfb1087df215e3be94206cfdf45f64815888ea0749af4c0ae5636fabea0abab8c2e938ab3ad7367e9bfa52/9d/32/9d32bd84883afc41e54348e396c2f99a/9d32bd84883afc41e54348e396c2f99a_1200.jpeg?t=4b419e2c814268686ff05d2c25965be9&amp;ttl=1642926021
        const imageData = JSON.stringify(shuffledImagesArr.map(image => image.dataset.url));

        const type = Engine.Settings.recompressionFormat.value;
        const quality = parseFloat(Engine.Settings.recompressionQuality.value) / 100;
        const script = `
            new Promise(async (resolve, reject) => {
                try {
                    let images = [];
                    const data = ${imageData};
                    for(const d of data) {
                        const canvas = await imgReverser(d);
                        const uri = canvas.toDataURL('${type}', ${quality})
                        images.push(uri);
                    }
                    resolve(images);
                } catch(error) {
                    reject(error);
                }
            });
        `;

        const fixedImagesArr = await Engine.Request.fetchUI(requestChapter, script, 60000, true);
        let fixedArrIndex = 0;
        return imagesArr.map(image => {
            if (image.className.includes('shuffled')) {
                return fixedImagesArr[fixedArrIndex++];
            }
            return image.dataset.url;
        });
    }
}