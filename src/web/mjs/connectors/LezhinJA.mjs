import Lezhin from './templates/Lezhin.mjs';

export default class LezhinJA extends Lezhin {

    constructor() {
        super();
        super.id = 'lezhin-ja';
        super.label = 'Lezhin (japanese)';
        this.tags = [ 'webtoon', 'japanese' ];
        this.url = 'https://www.lezhin.jp/ja';
        this.links = {
            login: this.url + '/login#email'
        };
        this.requestOptions.headers.set( 'x-cookie', 'x-lz-locale=ja_JP' );
        this.requestOptions.headers.set( 'x-lz-locale', 'ja-JP' );
        this.locale = 'ja-JP';
    }
}