import WordPressMadara from './templates/WordPressMadara.mjs';

export default class LovableSubs extends WordPressMadara {

    constructor() {
        super();
        super.id = 'lovablesubs';
        super.label = 'lovablesubs';
        this.tags = [ 'manga', 'turkish' ];
        this.url = 'https://lovablesubs.com';
    }
}