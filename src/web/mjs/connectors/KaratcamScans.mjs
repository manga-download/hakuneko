import WordPressMadara from './templates/WordPressMadara.mjs';

export default class KaratcamScans extends WordPressMadara {

    constructor() {
        super();
        super.id = 'karatcamscans';
        super.label = 'Karatcam Scans';
        this.tags = [ 'manga', 'french' ];
        this.url = 'https://karatcam-scans.fr';
    }

    async _getChaptersAjaxOld(dataID) {
        let uri = new URL(this.path + '/wp-admin/admin-ajax.php', this.url);
        let request = new Request(uri, {
            method: 'POST',
            body: 'action=manga_views&manga=' + dataID,
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'x-referer': this.url
            }
        });
        const data = await this.fetchDOM(request, this.queryChapters);
        if (data.length) {
            return data;
        } else {
            throw new Error('No chapters found (old ajax endpoint)!');
        }
    }
}