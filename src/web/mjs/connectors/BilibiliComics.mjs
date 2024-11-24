import BilibiliManhua from './BilibiliManhua.mjs';

export default class BilibiliComics extends BilibiliManhua {

    constructor() {
        super();
        super.id = 'bilibili-comics';
        super.label = 'Bilibili Comics (Multi-lingual)';
        this.tags = [ 'webtoon', 'multi-lingual' ];
        this.url = 'https://www.bilibilicomics.com';
        this.links = {
            login: 'https://www.bilibilicomics.com/account'
        };

        this.config.language.input = 'select';
        this.config.language.options = [
            { value: 'fr', name: 'French' },
            { value: 'en', name: 'English' },
            { value: 'cn', name: 'Chinese' },
            { value: 'id', name: 'Indonesian' },
            { value: 'es', name: 'Spanish' },
        ];
        this.config.language.options.value = 'en';

        this.config.picquality.options =
        [
            { value: 'raw', name: 'Raw' },
            { value: 'hd', name: 'HD' },
            { value: 'sd', name: 'SD' },
        ];
        this.config.picquality.options.value = 'raw';
    }

    //override quality formula cause its different for Bilibilicomics than for BilibiliManhua
    getImageSizeByQuality(width) {

        //quality is an optional url parameter to put when user select lowest quality
        let o = {
            imgWidth : width,
            quality : undefined
        };

        if (width < 1) return o;

        const choosedQuality = this.config.picquality.value;
        const WindowWidth = 3000; //r = window.innerWidth, force it to max. Why are they adjusting picture to window width?

        choosedQuality === 'raw' ? o.imgWidth = WindowWidth <= 1000 ? 1000 : WindowWidth <= 1200 ? 1200 : WindowWidth <= 1600 ? 1600 : WindowWidth <= 2000 ? 2000 : width : choosedQuality === 'hd' ? o.imgWidth = WindowWidth <= 1200 ? 800 : 1000 : (o.imgWidth = WindowWidth <= 1200 ? 600 : 800, o.quality = 50);

        if (this.config.forcepicturesize.value) {
            o.imgWidth = Math.max(o.imgWidth, width);
            o.quality = undefined;
        }
        return o;
    }

}
