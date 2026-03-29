import WordPressMadara from './templates/WordPressMadara.mjs';
//dead?
export default class WhatStatus extends WordPressMadara {

    constructor() {
        super();
        super.id = 'whatstatus';
        super.label = 'WhatStatus';
        this.tags = [ 'manga', 'webtoon', 'english' ];
        this.url = 'https://whatstatus.co';
    }
}