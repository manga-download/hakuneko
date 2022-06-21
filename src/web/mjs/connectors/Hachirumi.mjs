import Guya from './templates/Guya.mjs';

export default class Hachirumi extends Guya {

    constructor() {
        super();
        super.id = 'hachirumi';
        super.label = 'Hachirumi';
        this.tags = [ 'manga', 'english', 'scanlation' ];
        this.url = 'https://hachirumi.com';
    }
}