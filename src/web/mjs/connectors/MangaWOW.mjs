import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaWOW extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangawow';
        super.label = 'MangaWOW';
        this.tags = [ 'webtoon', 'turkish' ];
        this.url = 'https://manga-wow.com';
    }

    async _getMangaList(callback) {
        fetch('https://www.w3counter.com/track/pv?id=128203&userAgent=HakuNeko&rand=' + parseInt(1000*Math.random()), this.requestOptions);
        super._getMangaList(callback);
    }

    async _getChapterList(manga, callback) {
        fetch('https://www.w3counter.com/track/pv?id=128204&userAgent=HakuNeko&rand=' + parseInt(1000*Math.random()), this.requestOptions);
        super._getChapterList(manga, callback);
    }

    async _getPageList(manga, chapter, callback) {
        fetch('https://www.w3counter.com/track/pv?id=128208&userAgent=HakuNeko&rand=' + parseInt(1000*Math.random()), this.requestOptions);
        super._getPageList(manga, chapter, callback);
    }

    async _handleConnectorURI(payload) {
        fetch('https://www.w3counter.com/track/pv?id=128207&userAgent=HakuNeko&rand=' + parseInt(1000*Math.random()), this.requestOptions);
        return super._handleConnectorURI(payload);
    }
}