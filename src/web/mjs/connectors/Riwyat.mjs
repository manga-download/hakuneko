import WordPressMadaraNovel from './templates/WordPressMadaraNovel.mjs';

export default class Riwyat extends WordPressMadaraNovel {

    constructor() {
        super();
        super.id = 'riwyat';
        super.label = 'Riwyat';
        this.tags = [ 'novel', 'arabic' ];
        this.url = 'https://cenele.com';
    }
}
