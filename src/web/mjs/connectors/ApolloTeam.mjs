import WordPressMangastream from './templates/WordPressMangastream.mjs';

export default class ApolloTeam extends WordPressMangastream {

    constructor() {
        super();
        super.id = 'apolloteam';
        super.label = 'The Apollo Team';
        this.tags = [ 'webtoon', 'english' ];
        this.url = 'https://theapollo.team';
        this.path = '/manga/list-mode/';
    }
}