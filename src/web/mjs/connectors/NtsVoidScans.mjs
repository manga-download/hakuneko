import WordPressMadara from './templates/WordPressMadara.mjs';
export default class NtsVoidScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'ntsvoidscans';
        super.label = 'Void Scans';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://voidscans.com';
    }

    async getMangas() {
        throw new Error('This website is dead. Use InfernalVoidScans connector instead.');
    }

    async getChapters() {
        throw new Error('This website is dead. Use InfernalVoidScans connector instead.');
    }

    async getPages() {
        throw new Error('This website is dead. Use InfernalVoidScans connector instead.');
    }

}
