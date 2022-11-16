import Connector from '../engine/Connector.mjs';
export default class MangaTown extends Connector {
    constructor() {
        super();
        super.id = 'mangatown';
        super.label = 'MangaTown';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://www.mangatown.com';
    }
    async _getMangas() {
        let mangaList = [];
        let request = new Request(this.url + '/directory/', this.requestOptions);
        let data = await this.fetchDOM(request, 'div.next-page a:nth-last-child(3)');
        let pageCount = parseInt(data[0].text.trim());
        for(let page = 1; page <= pageCount; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangaList.push(...mangas);
        }
        return mangaList;
    }
    async _getMangasFromPage(page) {
        let request = new Request(this.url + '/directory/0-0-0-0-0-0/' + page + '.htm', this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.manga_pic_list li p.title a');
        return data.map(element => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, request.url),
                title: element.title.trim()
            };
        });
    }
    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions);
        let data = await this.fetchDOM(request, 'ul.chapter_list li');
        return data.map(element => {
            let link = element.querySelector('a');
            let title = link.text.replace(manga.title, '').trim();
            let texts = [...element.querySelectorAll('span')];
            for(let i = 0; i < texts.length; i++) {
                if(texts[i].getAttribute('class') != 'time') {
                    if(texts[i].textContent.match(/^Vol \d+/i)) {
                        title = '[' + texts[i].textContent + '] ' + title;
                    } else {
                        title = title + ' ' + texts[i].textContent;
                    }
                }
            }
            return {
                id: this.getRootRelativeOrAbsoluteLink(link, request.url),
                title: title,
                language: ''
            };
        });
    }
    async _getPages(chapter) {
        let request = new Request(new URL(chapter.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'div.manga_read_footer div.page_select select option');
        let imgpages = data
            .filter(option => !option.value.endsWith('featured.html'))
            .map(element => this.getAbsolutePath(element.value, request.url));
        //NOW we have all the pages, get the picture url from each page
        //and create the payloads with mangahere referer
        let imglist = [];
        for (let i = 0; i<imgpages.length; i++ ) {
            let request = new Request(imgpages[i], this.requestOptions);
            data = await this.fetchDOM( request, 'source#image' );
            let pic = this.createConnectorURI({
                url: this.getAbsolutePath(data[0].src, request.url).replace('hakuneko://', 'https://'),
                referer: 'mangahere.com',
            });
            imglist.push(pic);
        }
        return imglist;
    }
    //Overload _handleConnectorURI to download pictures with payload referer
    async _handleConnectorURI(payload) {
        let request = new Request(payload.url, this.requestOptions);
        request.headers.set('x-referer', payload.referer);
        let response = await fetch(request);
        let data = await response.blob();
        return this._blobToBuffer(data);
    }
}
