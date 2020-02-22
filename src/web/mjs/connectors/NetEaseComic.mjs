import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class NetEaseComic extends Connector {

    constructor() {
        super();
        super.id = 'neteasecomic';
        super.label = '网易漫画 (NetEase Comic)';
        this.tags = [ 'manga', 'webtoon', 'chinese' ];
        this.url = 'https://manga.bilibili.com';
    }

    async _getMangaFromURI(uri) {
        let request = new Request(new URL('/twirp/comic.v2.Comic/ComicDetail?device=pc&platform=web', this.url), {
            method: 'POST',
            body: JSON.stringify({
                comic_id: parseInt(uri.pathname.match(/\/mc(\d+)/)[1])
            }),
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            }
        });
        let data = await this.fetchJSON(request);
        return new Manga(this, data.data.id, data.data.title);
    }

    async _getMangas() {
        let mangaList = [];
        for(let page = 1, run = true; run; page++) {
            let mangas = await this._getMangasFromPage(page);
            mangas.length > 0 ? mangaList.push(...mangas) : run = false;
        }
        return mangaList;
    }

    async _getMangasFromPage(page) {
        let uri = new URL('/twirp/comic.v1.Comic/ClassPage', this.url);
        uri.searchParams.set('device', 'pc');
        uri.searchParams.set('platform', 'web');
        let request = new Request(uri, {
            method: 'POST',
            body: JSON.stringify({
                style_id: -1,
                area_id: -1,
                is_free: -1,
                is_finish: -1,
                order: 0,
                page_size: 18,
                page_num: page
            }),
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            }
        });
        let data = await this.fetchJSON(request);
        return data.data.map(entry => {
            return {
                id: entry.season_id,
                title: entry.title.trim()
            };
        });
    }

    async _getChapters(manga) {
        let uri = new URL('/twirp/comic.v2.Comic/ComicDetail', this.url);
        uri.searchParams.set('device', 'pc');
        uri.searchParams.set('platform', 'web');
        let request = new Request(uri, {
            method: 'POST',
            body: JSON.stringify({
                comic_id: manga.id
            }),
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            }
        });
        let data = await this.fetchJSON(request);
        // entry.is_in_free || !entry.is_locked
        return data.data.ep_list.map(entry => {
            return {
                id: entry.id,
                title: entry.short_title + ' - ' + entry.title,
                language: ''
            };
        });
    }

    async _getPages(chapter) {
        let uri = new URL('/twirp/comic.v1.Comic/GetImageIndex', this.url);
        uri.searchParams.set('device', 'pc');
        uri.searchParams.set('platform', 'web');
        let request = new Request(uri, {
            method: 'POST',
            body: JSON.stringify({
                ep_id: chapter.id
            }),
            headers: {
                'Content-Type': 'application/json;charset=UTF-8'
            }
        });
        let data = await this.fetchJSON(request);

        uri = new URL(data.data.path, data.data.host);
        let images = await this._getImageIndex(uri);
        return images.map(image => this.createConnectorURI(image));
    }

    async _handleConnectorURI(payload) {
        /*
         * TODO: only perform requests when from download manager
         * or when from browser for preview and selected chapter matches
         */
        let request = new Request(new URL(payload), this.requestOptions);
        let data = await this.fetchJSON(request);
        let uri = new URL(data.data[0].url);
        uri.searchParams.set('token', data.data[0].token);
        uri.searchParams.set('ts', parseInt(Date.now()/1000).toString(16));
        return super._handleConnectorURI(uri.href);
    }

    async _getImageIndex(uri) {
        let request = new Request(uri);
        let response = await fetch(request);
        let encrypted = await response.arrayBuffer();
        let match = uri.pathname.match(/manga\/(\d+)\/(\d+)\/data/);
        let mangaID = parseInt(match[1]);
        let chapterID = parseInt(match[2]);

        let decrypted = this._decrypt(encrypted, mangaID, chapterID);
        let inflated = this._inflate(decrypted);

        return [];
    }

    _decrypt(buffer, mangaID, chapterID) {
        let key = [
            chapterID & 0xff,
            chapterID >> 8 & 0xff,
            chapterID >> 16 & 0xff,
            chapterID >> 24 & 0xff,
            mangaID & 0xff,
            mangaID >> 8 & 0xff,
            mangaID >> 16 & 0xff,
            mangaID >> 24 & 0xff
        ];
        // create a view for the buffer
        let decrypted = new Uint8Array(buffer, 9);
        console.log('Encrypted:', decrypted);
        for(let index in decrypted) {
            decrypted[index] ^= key[index % key.length];
        }
        console.log('Decrypted:', decrypted);
        return buffer;

        /*
        function decryptBiliComicIndex($data, $mangaid, $epid) {
            if (substr($data, 0, 9) !== 'BILICOMIC') {
                return false;
            }
            $body = substr($data, 9);
            $size = strlen($body);
            $out = str_repeat("\0", $size);
            $key = [
                $epid & 0xff,
                $epid >> 8 & 0xff,
                $epid >> 16 & 0xff,
                $epid >> 24 & 0xff,
                $mangaid & 0xff,
                $mangaid >> 8 & 0xff,
                $mangaid >> 16 & 0xff,
                $mangaid >> 24 & 0xff
            ];

            for ($i = 0; $i < $size; $i++) {
                $byte = ord($body[$i]);
                $byte ^= ($key[($i) % 8]);
                $out[$i] = chr($byte);
            }
        }
        */
    }

    _inflate(deflated) {
        return [];
        /*
        function readBiliComicIndexZip(MemoryStream $out) {
            $out->littleEndian = true;
            $out->position = $out->size - 22;
            $signature = $out->readData(4);
            $num = $out->short;
            $start = $out->short;
            $numRecords = $out->short;
            $total = $out->short;
            $cdsize = $out->long;
            $cdoffset = $out->long;
            $commentlen = $out->short;

            $out->position = $cdoffset + 4 + 2 * 6;
            $crc = $out->ulong;
            $compressedSize = $out->long;
            $uncompressedSize = $out->long;

            $out->position = 26;
            $fnameLen = $out->short;
            $extraLen = $out->short;
            $out->position += $fnameLen + $extraLen;

            $compressedData = $out->readData($compressedSize);
            $data = gzinflate($compressedData);

            if (crc32($data) !== $crc) {
                return false;
            }
            return $data;
        }
        */
    }
}