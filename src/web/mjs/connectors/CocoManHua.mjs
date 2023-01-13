import Mangadig from './MangaDig.mjs';

export default class CocoManHua extends Mangadig {

    constructor() {
        super();
        super.id = 'cocomanhua';
        super.label = 'Coco漫画';
        this.tags = [ 'webtoon', 'chinese' ];
        this.url = 'https://www.colamanhua.com';
        this.path = '/show?page=';
        this.pathSuffix = '';
        this.queryMangaTitle = 'dl.fed-deta-info dd.fed-deta-content h1.fed-part-eone';
        this.queryMangasPageCount = 'div.fed-page-info a.fed-show-sm-inline';
        this.queryMangas = 'ul.fed-list-info li.fed-list-item a.fed-list-title';
        this.queryChapters = 'div.all_data_list ul li a';
        this.config.throttle = {
            label: 'Throttle Requests [ms]',
            description: 'Enter the timespan in [ms] to delay consecuitive HTTP requests.\nThe website may block images for to many consecuitive requests.',
            input: 'numeric',
            min: 50,
            max: 1000,
            value: 250
        };
    }

}
