export default class Bookmark {

    constructor( manga ) {
        //this.id = Symbol();
        this.title = {
            connector: manga.connector.label,
            manga: manga.title
        };
        this.key = {
            connector: manga.connector.id,
            manga: manga.id
        };
    }
}