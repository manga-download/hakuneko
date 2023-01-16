import Connector from '../engine/Connector.mjs';
import Streamtape from '../videostreams/Streamtape.mjs';
import Mav from '../videostreams/Mav.mjs';
import SendVid from '../videostreams/SendVid.mjs';
import VoeSX from '../videostreams/VoeSX.mjs';

export default class MavAnime extends Connector {
    constructor() {
        super();
        super.id = 'mavanimes';
        super.label = 'MavAnimes';
        this.tags = [ 'anime', 'french', 'multi-lingual' ];
        this.url = 'https://www.mavanimes.co';
        this.genres = ['/tous-les-animes-en-vf', '/tous-les-animes-en-vostfr-fullhd-2'];
        this.config = {
            resolution: {
                label: 'Preferred Resolution',
                description: 'Try to download video in the selected resolution.\nIf the resolution is not supported, depending on the mirror the download may fail, or a fallback resolution may be used!',
                input: 'select',
                options: [
                    { value: '', name: 'Mirror\'s Default' },
                    { value: '360p', name: '360p' },
                    { value: '480p', name: '480p' },
                    { value: '720p', name: '720p' },
                    { value: '1080p', name: '1080p' }
                ],
                value: ''
            }
        };

    }

    async _getMangas() {
        let mangaslist = [];
        for (let genre of this.genres) {
            let request = new Request( new URL(genre, this.url), this.requestOptions );
            let data = await this.fetchDOM( request, 'div#az-slider li a' );
            let mangas = data.map(element => {
                return {
                    id : element.pathname,
                    title : element.text.trim()
                };
            });
            mangaslist.push(...mangas);
        }
        return mangaslist;
    }

    async _getChapters(manga) {
        let chapterslist = [];
        let request = new Request( new URL(manga.id, this.url), this.requestOptions );
        let data = await this.fetchDOM( request, 'body' );
        //first attempt to get the episodes list and various hosts
        let chaptersNodes = data[0].querySelectorAll('header.entry-header h2 a');
        for (let i = 0; i < chaptersNodes.length; i++) {
            chapterslist.push(...await this.getChapterPlayers(chaptersNodes[i]));
        }
        //second attempts, with another CSS Selector
        if (chapterslist.length == 0) {
            chaptersNodes = data[0].querySelectorAll('div.entry-content a');
            for (let i = 0; i < chaptersNodes.length; i++) {
                chapterslist.push(...await this.getChapterPlayers(chaptersNodes[i]));
            }
        }
        //if nothing worked, check if the page itself got iframes
        // Somes film does not have a chapter page and just one page with video frames
        if (chapterslist.length == 0) {
            try{
                chapterslist.push(...await this.getChapterPlayers(new URL(manga.id, this.url), manga));
            } catch(e) {
            //
            }
        }
        if (chapterslist.length == 0) {
            throw'No episode / supported video hoster found :/ !';
        }
        return chapterslist;
    }

    async getChapterPlayers(chapterNode, manga) {
    	  const link = chapterNode.href ? chapterNode.href : chapterNode;
    	  const title = chapterNode.text ? chapterNode.text.trim() : manga.title;
        let request = new Request(link, this.requestOptions);
        let scriptPages = `
        new Promise(resolve => {
            resolve([...document.querySelectorAll('iframe')].map(el => el.src));
        });
        `;
        let data = await Engine.Request.fetchUI(request, scriptPages);
        return data.map(element => {
            let sourcesite = this.getWebsiteTag(element);
            return {
                id: element,
                title : sourcesite + ' '+ title.replace(':•', '').trim()
            };
        }).filter(el => !el.title.match(/\[UNK\]/));
    }

    async _getPages(chapter) {

        let sourcesite = this.getWebsiteTag(chapter.id);
        switch(sourcesite) {
            case '[MAV]':
            {
                let vid = await new Mav(this.url, chapter.id).getStream(this.config.resolution.value);
                return vid.type == 'mp4' ? {video: vid.file, subtitles: [] }: {hash: 'id,language,resolution', mirrors: [ vid.file ], subtitles: [], referer : chapter.id };
            }
            case '[Streamtape]':
            {
                let vid = await new Streamtape(chapter.id).getStream();
                return{video: vid, subtitles: [] };
            }
            case '[SendVid]':
            {
                let vid = await new SendVid(chapter.id).getStream();
                return {hash: 'id,language,resolution', mirrors: [ vid ], subtitles: [], referer : chapter.id };
            }
            case '[VOESX]':
            {
                let vid = await new VoeSX(chapter.id).getStream();
                return vid.mp4 ? {video: vid.mp4, subtitles: [] }: {hash: 'id,language,resolution', mirrors: [ vid.hls ], subtitles: [], referer : chapter.id };
            }
            default:
                break;
        }

    }

    getWebsiteTag(link) {
        let sourcesite = '[UNK]';
        sourcesite = link.match(/mavplay|mavlecteur|mavavid/) ? '[MAV]' : sourcesite;
        sourcesite = link.match(/streamtape/) ? '[Streamtape]' : sourcesite;
        sourcesite = link.match(/sendvid.com/) ? '[SendVid]' : sourcesite;
        sourcesite = link.match(/voe.sx/) ? '[VOESX]' : sourcesite;
        return sourcesite;
    }
}