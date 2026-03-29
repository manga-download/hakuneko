import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class AsuraLightNovel extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'asuralightnovel';
        super.label = 'Asura Light Novel';
        this.tags = [ 'novel', 'english' ];
        this.url = 'https://asuralightnovel.com';
    }
}
