export default class FrontendLoader {

    static load(identifier) {
        switch(identifier) {
            case 'classic-light:polymer':
                return FrontendLoader._loadClassicLightPolymer();
            default:
              console.error(`Failed to load frontend with id '${identifier}'!`);
        }
    }

    static _loadClassicLightPolymer() {

        let element = document.createElement('hakuneko-app');
        document.body.appendChild(element);

        let webcomponents = document.createElement('script');
        webcomponents.src = './lib/webcomponentsjs/webcomponents-loader.js';
        document.head.appendChild(webcomponents);

        let frontend = document.createElement('link');
        frontend.href = './lib/hakuneko/app.html';
        frontend.rel = 'import';
        document.head.appendChild(frontend);
    }
}