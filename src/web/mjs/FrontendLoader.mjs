export default class FrontendLoader {

    static load(identifier) {
        switch(identifier) {
            case 'frontend@classic-light':
                return FrontendLoader._loadClassicLightPolymer(identifier);
            default:
              console.error(`Failed to load frontend with id '${identifier}'!`);
        }
    }

    static _loadClassicLightPolymer(identifier) {

        let element = document.createElement('hakuneko-app');
        document.body.appendChild(element);

        let webcomponents = document.createElement('script');
        webcomponents.src = './lib/webcomponentsjs/webcomponents-loader.js';
        document.head.appendChild(webcomponents);

        let frontend = document.createElement('link');
        frontend.href = `./lib/hakuneko/${identifier}/app.html`;
        frontend.rel = 'import';
        document.head.appendChild(frontend);
    }
}