import WordPressMadara from './templates/WordPressMadara.mjs';

export default class AOC extends WordPressMadara {

    /**
     *
     */
    constructor() {
        super();
        super.id = 'aoc';
        super.label = 'AoC';
        this.tags = [ 'manga', 'high-quality', 'english', 'scanlation' ];
        this.url = 'https://aoc.moe';
    }
}