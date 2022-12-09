export default class Dood {

    constructor(url) {
        this._uri = new URL(url);
    }

    async getStream() {
    	
	        let script = `
	            new Promise(resolve => {
	            	const hn_tok = makePlay();
                    resolve({ tok : hn_tok, doc : document.documentElement.innerHTML });
	            });
	        `;
	        let request = new Request(this._uri);
	        const data =  await Engine.Request.fetchUI(request, script, 30000);
	        //end of final vidoe url
	        const videourlend = data.tok;

            //get the url for requestion the video url beginning
            let dom = (new DOMParser).parseFromString(data.doc, "text/html"); 
            const requestthing = dom.documentElement.innerHTML.match(/(\/pass_md5\S+)'/)[1];
            const url = new URL(requestthing, 'https://dood.wf');

            request = new Request(url);
            request.headers.set('x-referer', this._uri);
            request.headers.set('X-Requested-With', 'XMLHttpRequest');
            const response = await fetch(request);
            let videolink = await response.text();

            return videolink + videourlend;
         }
   
    
}