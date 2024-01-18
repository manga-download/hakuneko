import MangAdventure from './templates/MangAdventure.mjs';

export default class ArcRelight extends MangAdventure {
    constructor() {
        super();
        super.id = 'arcrelight';
        super.label = 'Arc-Relight';
        this.tags = ['manga', 'english'];
        this.url = 'https://arc-relight.com';
    }
}
