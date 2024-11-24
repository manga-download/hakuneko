import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
import Kaas from '../videostreams/Kaas.mjs';


export default class KickassAnimeRo extends Connector {

    constructor() {
        super();
        super.id = 'kickassanimero';
        super.label = 'KickassAnimeRo';
        this.tags = [ 'anime', 'english' ];
        this.url = 'https://www2.kickassanime.ro';
        //this.bannedHosts = ['Steamango', 'Oload', 'OpenUpload', 'Bestream']; //Dead websites
    }

/*
    async _getMangaFromURI(uri) {
        const request = new Request(uri, this.requestOptions);
        const data = await this.fetchDOM(request, 'meta[property="og:title"]');
        return new Manga(this, uri.pathname, data[0].content.trim());
    }
*/
  
    async _getMangas() {
        const uri = new URL('/anime-list', this.url);
        const data = await this.getAppData(uri);
        return data.animes.map(element => {
            return {
                id : element.slug,
                title : element.name.trim()
            }
        })
    }

    async _getChapters(manga) {
        const uri = new URL(manga.id, this.url);
        const data = await this.getAppData(uri);
        return data.anime.episodes.map(element => {
            return {
                id: element.slug,
                title: element.epnum.trim()
            };
        });
    }

    async _getPages(chapter) {
   	  
        const uri = new URL(chapter.id, this.url);
        const request = new Request(uri, this.requestOptions);
        const data = await this.getAppData(uri);

        let playersList = [];
        //default hoster : KAAS
        for (let i = 1; i < 5; i++){
        	let elname = 'link'+i;
        	(data.episode[elname].trim() != '') ? playersList.push({host : 'KAAS', link : data.episode[elname]}) : false;
        }
        /*
        //external hosters
         data.ext_servers.map(element =>{
              !this.bannedHosts.includes(element.host.name) ? playersList.push({host : element.name, link : element.link}) :false;
         });
        */
        
        const vidlink = playersList.find(element => element.host.match('KAAS'));
        if (!vidlink) {
        	throw new Error ('No supported hoster found !');
        }
        
        //Check if link is external
        if (this._uri.href.match(/\/axplayer/)){
           const realurl = decodeURI(this._uri.searchParams.get('data'));

        	 throw new Error ('External hoster found !');
        	 

        } else {
           const vid = await new Kaas(vidlink.link).getStream();
           return { mirrors: [ vid ], subtitles: [] };       	
        }
    }
    
    async getAppData(url) {
        const request = new Request(url, this.requestOptions);
        const script = `new Promise(resolve => {
                resolve(window.appData);
            });`;
        return await Engine.Request.fetchUI(request, script, 5000);    	
    }
    
    
}