import TakeShoboNew from './templates/TakeShoboNew.mjs';

export default class StoriaDash extends TakeShoboNew {

    constructor() {
        super();
        super.id = 'storiadash';
        super.label = 'ストーリアダッシュ (Storia Dash)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://storia.takeshobo.co.jp';
    }
}