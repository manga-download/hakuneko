import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class Kiryuu extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'kiryuu';
        super.label = 'Kiryuu';
        this.tags = [ 'manga', 'indonesian' ];
        this.url = 'https://kiryuu.co';
        this.path = '/manga/list-mode/';
    }

    async _getPages(chapter) {
        let pageList = await super._getPages(chapter);
        // TODO: Maybe use regex /(iklan\.png|\.5\.jpg|,5\.jpg|ZZ\.jpg)$/.test(link)
        // or use array ['iklan.png', '.5.jpg', ',5.jpg', 'ZZ.jpg'].some(pattern => link.endsWith(pattern))
        return pageList.filter(link => {
            return !link.includes('.filerun.')
                && !link.endsWith('iklan.png')
                && !link.endsWith('.5.jpg')
                && !link.endsWith(',5.jpg')
                && !link.endsWith('ZZ.jpg');
        });
    }
}