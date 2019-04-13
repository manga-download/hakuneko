module.exports = {
    version: require('./client/package.json').devDependencies.electron, // '2.0.18'
    author: 'Ronny Wegener <wegener.ronny@gmail.com>',
    name: {
        package: 'hakuneko-desktop',
        product: 'HakuNeko Desktop',
    },
    description: {
        short: 'Manga Downloader',
        long: 'Desktop Client for HakuNeko Web-Application'
    },
    license: 'Unlicense',
    year: (new Date()).getFullYear(),
    url: 'https://github.com/manga-download/hakuneko',
    binary: {
        windows: 'hakuneko.exe',
        linux: 'hakuneko',
        darwin: 'HakuNeko'
    },
    meta: {
        section: 'net',
        type: 'Application',
        categories: 'Network;FileTransfer;',
        menu: 'Applications/Network/File Transfer',
        dependencies: 'libc6'
    }
}