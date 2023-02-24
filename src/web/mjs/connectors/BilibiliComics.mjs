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
        //override BilibiliManhua config as we need lanuage switch. Difference is handled in the main code with (this.config.language) ? : test
        this.config = {
            format:  {
                label: 'Preferred format',
                description: 'format of images\nwebp (low)\njpg (medium)\npng (high))',
                input: 'select',
                options: [
                    { value: 'webp', name: 'webp' },
                    { value: 'jpg', name: 'jpg' },
                    { value: 'png', name: 'png' },
                ],
                value: 'png'
            },
            language: {
                label: 'Language Settings',
                description: 'Choose the language to use. This will affect available manga lists',
                input: 'select',
                options: [
                    { value: 'fr', name: 'French' },
                    { value: 'en', name: 'English' },
                    { value: 'cn', name: 'Chinese' },
                    { value: 'id', name: 'Indonesian' },
                    { value: 'es', name: 'Spanish' },
                ],
                value: 'en'
            },
            picquality: {
                label: 'Quality Settings',
                description: 'Choose the prefered quality',
                input: 'select',
                options: [
                    { value: 'raw', name: 'Raw' },
                    { value: 'hd', name: 'HD' },
                    { value: 'sd', name: 'SD' },
                ],
                value: 'raw'
            },
            forcepicturesize : {
                label: 'Force max quality (Experimental)',
                description: 'Force server to send pictures with max size. Override "quality" settings',
                input: 'checkbox',
                value: false
            }
        };

    }

    //override quality formula cause its different for Bilibilicomics than for BilibiliManhua
    getImageSizeByQuality(width) {

        //q is an optional url parameter to put when user selectod lowest quality
        let o = {
            w : width,
            q : undefined
        };

        if (width < 1) return o;

        const n = this.config.picquality.value;
        const r = 3000; //r = window.innerWidth, force it to max. Why are they adjusting picture to window width?

        n === 'raw' ? o.w = r <= 1000 ? 1000 : r <= 1200 ? 1200 : r <= 1600 ? 1600 : r <= 2000 ? 2000 : width : n === 'hd' ? o.w = r <= 1200 ? 800 : 1000 : (o.w = r <= 1200 ? 600 : 800, o.q = 50);

        if (this.config.forcepicturesize.value) {
            o.w = Math.max(o.w, width);
            o.q = undefined;
        }
        return o;
    }

}
