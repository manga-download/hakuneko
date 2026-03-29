import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Deliscan extends WordPressMadara {

    constructor() {
        super();
        super.id = 'deliscan';
        super.label = 'Deliscan';
        this.tags = [ 'webtoon', 'french' ];
        this.url = 'https://deliscan.xyz';
    }
}