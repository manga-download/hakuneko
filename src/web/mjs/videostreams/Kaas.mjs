export default class Kaas {

    constructor(url) {
        this._uri = new URL(url);
    }

    async getStream() {
        

        if (this._uri.href.match(/\/axplayer/)){
           const realurl = decodeURI(this._uri.searchParams.get('data'));

           throw new Error('Kaas : this use an external player, you need to implement it :/');

        }

        if (this._uri.href.match(/\/dust\/player/)){
	        //get window.sources
	        let script = `
	            new Promise(resolve => {
	                resolve(sources);
	            });
	        `;
	        let request = new Request(this._uri);
	        const sources = await Engine.Request.fetchUI(request, script, 3000);
	        
	        const mav = sources.find(element => element.name.match(/MAVERICK/i)).src;
            const referer = new URL(mav);

            const videoid = referer.href.match(/\/embed\/(\S+)$/)[1];
            const apiurl = new URL('/api/source/'+videoid, referer.origin);

            request = new Request(apiurl);
            request.headers.set('x-referer', referer);
            request.headers.set('accept', 'application/json, text/plain, */*');
            const response = await fetch(request);
            const data = await response.json(); 
            return new URL(data.hls, referer.origin).href;
         }
    

    }
}