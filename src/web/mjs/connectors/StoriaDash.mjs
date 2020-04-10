import TakeShobo from './templates/TakeShobo.mjs';

export default class StoriaDash extends TakeShobo {

    constructor() {
        super();
        super.id = 'storiadash';
        super.label = 'ストーリアダッシュ (Storia Dash)';
        this.tags = [ 'manga', 'japanese' ];
        this.url = 'https://storia.takeshobo.co.jp';
    }
}