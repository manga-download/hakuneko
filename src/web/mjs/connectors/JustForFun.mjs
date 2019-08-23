import WordPressMadara from './templates/WordPressMadara.mjs';

/**
 *
 */
export default class JustForFun extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'justforfun';
        super.label = 'Just for Fun';
        this.tags = [ 'manga', 'russian' ];
        this.url = 'https://just-for-fun.ru';
    }
}