import Connector from '../engine/Connector.mjs'

export default class ReadAllComics extends Connector {
    constructor() {
        super()
        super.id = 'readallcomics'
        super.label = 'Read All Comics'
        this.tags = ['comics', 'english']
        this.url = 'https://readallcomics.com'
        this.requestOptions.headers.set('x-referer', this.url)
    }

    async _getMangas() {
        let request = new Request(
            this.url + '/?story=&s=&type=comic',
            this.requestOptions
        )
        let data = await this.fetchDOM(request, 'ul.categories li a')
        return data.map((element) => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim(),
            }
        })
    }

    async _getChapters(manga) {
        let request = new Request(this.url + manga.id, this.requestOptions)
        let data = await this.fetchDOM(request, 'ul.list-story  li  a')
        return data.map((element) => {
            return {
                id: this.getRootRelativeOrAbsoluteLink(element, this.url),
                title: element.text.trim(),
                language: '',
            }
        })
    }

    async _getPages(chapter) {
        let request = new Request(this.url + chapter.id, this.requestOptions)
        let data = await this.fetchDOM(
            request,
            'body > center:nth-child(5) > center > div:nth-child(2) source'
        )
        return data.map((element) => this.getAbsolutePath(element, request.url))
    }
}
