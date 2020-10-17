import WordPressMadara from './templates/WordPressMadara.mjs';

export default class Toonily extends WordPressMadara {

    constructor() {
        super();
        super.id = 'toonily';
        super.label = 'Toonily';
        this.tags = [ 'webtoon', 'hentai', 'english' ];
        this.url = 'https://toonily.com';
    }
    createDOM( content, replaceImageTags, clearIframettributes ) {
        replaceImageTags = replaceImageTags !== undefined ? replaceImageTags : true ;
        clearIframettributes = clearIframettributes !== undefined ? clearIframettributes : true ;
        if( replaceImageTags ) {
            content = content.replace( /<img/g, '<source');
            content = content.replace( /<\/img/g, '</source');
            content = content.replace( /<use/g, '<source');
            content = content.replace( /<\/use/g, '</source');
        }
        if( clearIframettributes ) {
            content = content.replace( /<iframe[^<]*?>/g, '<iframe>');
        }
        let dom = document.createElement( 'html' );
        dom.innerHTML = content;
        return dom;
    }
}