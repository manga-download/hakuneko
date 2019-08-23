import WebAce from './WebAce.mjs';

/**
 *
 */
export default class YoungAceUp extends WebAce {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'youngaceup';
        super.label = 'ヤングエースUP (Young Ace UP)';
        this.tags = ['manga', 'japanese'];
        this.url = 'https://web-ace.jp/youngaceup'; // URL for copy/paste detection

        this.path = '/youngaceup/schedule/';
    }
}