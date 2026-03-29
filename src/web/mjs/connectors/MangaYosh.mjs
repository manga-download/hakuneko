import WordPressMadara from './templates/WordPressMadara.mjs';

export default class MangaYosh extends WordPressMadara {

    constructor() {
        super();
        super.id = 'mangayosh';
        super.label = 'MangaYosh';
        this.tags = [ 'manga', 'webtoon', 'indonesian' ];
        this.url = 'https://mangayosh.xyz';
        this.oldURL = 'https://mangayosh.bloghadi.me';
    }

    async _getChapters(manga) {
        let chapterList = await super._getChapters(manga);
        chapterList.forEach(chapter => chapter.id = this._decryptChapterID(chapter.id));
        return chapterList;
    }

    _decryptChapterID(chapterID) {
        let uri = new URL(chapterID, this.url);
        if(uri.searchParams.get('r')) {
            return this._decryptChapterID(atob(uri.searchParams.get('r')));
        }
        if(uri.searchParams.get('u')) {
            return this._decryptChapterID(uri.searchParams.get('u'));
        }
        if(uri.origin.endsWith('.tranivson.me')) {
            return uri.pathname + uri.search;
        }
        return this.getRootRelativeOrAbsoluteLink(chapterID.replace(this.oldURL, this.url), this.url);
    }
}