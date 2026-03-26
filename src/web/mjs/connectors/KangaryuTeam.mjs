import MangaReaderCMS from './templates/MangaReaderCMS.mjs';

export default class KangaryuTeam extends MangaReaderCMS {

    constructor() {
        super();
        super.id = 'kangaryuteam';
        super.label = 'Kangaryu Team';
        this.tags = [ 'manga', 'french' ];
        this.url = 'https://kangaryu-team.fr';

        this.language = 'fr';
    }
}