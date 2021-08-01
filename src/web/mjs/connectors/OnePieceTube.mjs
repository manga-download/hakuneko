import Connector from "../engine/Connector.mjs";

export default class OnePieceTube extends Connector {
    constructor() {
        super();
        super.id = 'onepiecetube';
        super.label = 'One Piece Tube';
        this.tags = ['manga', 'german'];
        this.url = 'http://onepiece-tube.com/';
    }

    async _getMangas() {
        return [
            {
                id: 'onepiece',
                title: 'One Piece'
            }
        ];
    }

    // eslint-disable-next-line no-unused-vars
    async _getChapters(manga) {
        let request = new Request(this.url + 'kapitel-mangaliste#oben', this.requestOptions);
        let data = await this.fetchDOM(request, 'div.sagatable table.list tbody tr');

        return data.filter(e => e.rowIndex !== 0).map(element => {
            let number = element.cells[0].innerText;
            let title = element.cells[1].innerText;
            return {
                id: `kapitel/${number}`,
                title: `${number} - ${title}`
            };
        });
    }

    async _getPages(chapter) {
        let request = new Request(`${this.url}${chapter.id}/1`, this.requestOptions);
        let data = await this.fetchDOM(request, 'td#tablecontrols a');

        data = await Promise.all(data.map(d => {
            const path = this.getAbsolutePath(d.pathname, request.url);
            const r = new Request(path, this.requestOptions);
            return this.fetchDOM(r, '#p');
        }));

        return data.map(r => r[0].src);
    }
}
