module.exports = {
    version: '2.0.18', // => This must match the electron client version!
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