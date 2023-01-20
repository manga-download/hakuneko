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
            quality:  {
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
        };

    }
}