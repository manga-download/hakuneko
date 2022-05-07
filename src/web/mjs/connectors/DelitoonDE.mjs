import Delitoon from './Delitoon.mjs';

export default class DelitoonDE extends Delitoon {

    constructor() {
        super();
        super.id = 'delitoonde';
        super.label = 'Delitoon (German)';
        this.tags = [ 'webtoon', 'german' ];
        this.url = 'https://www.delitoon.de';
        this.links = {
            login: 'https://www.delitoon.de/connexion'
        };
    }

    async _getMangas() {
        let mangaList = [];
        let genres = ['Romance', 'Boys%20Love', 'Drama', 'Sentimental', 'Historisch', 'Slice%20of%20Life', 'Fantasy', 'Komödie', 'Thriller', 'Action', 'Abenteuer', 'Sci-Fi'];
        for(let genre of genres) {
            let mangas = await this._getMangasFromPage(genre);
            mangaList.push(...mangas);
        }
        return mangaList;
    }

}