## Requirements

### Environment

Polymer is written in ES6 and may run directly in modern bowsers. To transpile ES6 to ES5 (for older browser), use minification or run tests, it is recommend to install the `polymer-cli` utility. This utility comes as an npm package for nodejs and must comply with the following versions:

- `nodejs` >= 6.10.3
- `npm` >= 4.6.1
- `polymer-cli` >= 1.0.2

Installation process:
```bash
# script to configure apt repository
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
# install nodejs and npm
sudo apt-get install -y nodejs
# install polymer-cli package
sudo npm install -g polymer-cli
# optional: create symbolic link if polymer command did not work
sudo ln -s /usr/bin/polymer /usr/local/bin/polymer
```

### Libraries

Can be downloaded from github...

- [`Polymer`](https://github.com/Polymer/polymer/releases) >= 2.0.0
- [`Webcomponents`](https://github.com/webcomponents/webcomponentsjs/releases) >= 1.0.0

## Serve

Run `polymer serve` from the directory containing the `index.html` file (might be the development directory, or the build directory) to start a local HTTP server and preview the web-application.

## Build/Deploy

Use `polymer build` to store compressed files in the `../cloud/htdocs` directory.