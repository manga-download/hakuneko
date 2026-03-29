import WordPressMadara from './templates/WordPressMadara.mjs';

export default class DetectiveConanAR extends WordPressMadara {

    constructor() {
        super();
        super.id = 'detectiveconanar';
        super.label = 'العربية  كونان (Conan Arabic)';
        this.tags = [ 'manga', 'arabic' ];
        this.url = 'https://manga.detectiveconanar.com';
    }
}