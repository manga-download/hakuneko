import HeanCms from './templates/HeanCms.mjs';

export default class YugenMangas extends HeanCms {
    constructor() {
        super();
        super.id = 'yugenmangas';
        super.label = 'YugenMangas';
        this.tags = [ 'webtoon', 'novel', 'spanish' ];
        this.url = 'https://yugenmangas.lat';
        this.api = 'https://api.yugenmangas.net';
        this.links = {
            login: 'https://yugenmangas.lat/login'
        };
    }
}
