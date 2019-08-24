export default class EbookGenerator {

    static createMimetype() {
        return 'application/epub+zip';
    }

    // TODO: use array and join with '\n' instead of string concatenation
    static createContainerXML() {
        let content = '';
        content += '<?xml version="1.0" encoding="UTF-8" ?>\n';
        content += '<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n';
        content += '    <rootfiles>\n';
        content += '        <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>\n';
        content += '    </rootfiles>\n';
        content += '</container>\n';
        return content;
    }

    static createStyleCSS() {
        let content = '';
        content += 'img {\n';
        content += '    max-height: 100%;\n';
        content += '    max-width: 100%;\n';
        content += '}\n';
        return content;
    }

    static createPageXHTML( pageName ) {
        let content = '';
        content += '<?xml version="1.0" encoding="utf-8"?>\n';
        content += '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">\n';
        content += '<html xmlns="http://www.w3.org/1999/xhtml">\n';
        content += '<head>\n';
        content += '    <link href="../css/style.css" rel="stylesheet" type="text/css"/>\n';
        content += '    <title>' + pageName + '</title>\n';
        content += '</head>\n';
        content += '<body>\n';
        content += '    <div>\n';
        content += '        <img alt="' + pageName + '" src="../img/' + pageName + '"/>\n';
        content += '    </div>\n';
        content += '</body>\n';
        content += '</html>\n';
        return content;
    }

    static createContentOPF( uid, title, pages ) {
        let content = '';
        content += '<?xml version="1.0" encoding="UTF-8"?>\n';
        content += '<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="' + uid + '" version="2.0">\n';
        content += '    <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">\n';
        content += '        <dc:title>' + title + '</dc:title>\n';
        content += '        <dc:language>en-UNDEFINED</dc:language>\n';
        content += '        <dc:identifier id="' + uid + '" opf:scheme="UUID">' + uid + '</dc:identifier>\n';
        content += '    </metadata>\n';
        content += '    <manifest>\n';
        content += '        <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>\n';
        content += '        <item id="style.css" href="css/style.css" media-type="text/css"/>\n';
        pages.forEach( ( page, index ) => {
            content += '        <item id="IMG_' + index + '" href="img/' + page.img + '" media-type="' + page.mime + '"/>\n';
            content += '        <item id="XHTML_' + index + '" href="xhtml/' + page.xhtml + '" media-type="application/xhtml+xml"/>\n';
        });
        content += '    </manifest>\n';
        content += '    <spine toc="ncx">\n';
        pages.forEach( ( page, index ) => {
            content += '        <itemref idref="XHTML_' + index + '"/>\n';
        });
        content += '    </spine>\n';
        content += '</package>\n';
        return content;
    }

    static createTocNCX ( uid, title, pages ) {
        let content = '';
        content += '<?xml version="1.0" encoding="UTF-8"?>\n';
        content += '<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">\n';
        content += '    <head>\n';
        content += '        <meta name="dtb:uid" content="' + uid + '"/>\n';
        content += '    </head>\n';
        content += '    <docTitle>\n';
        content += '        <text>' + title + '</text>\n';
        content += '    </docTitle>\n';
        content += '    <navMap>\n';
        pages.forEach( ( page, index ) => {
            index++;
            content += '        <navPoint id="TOC_' + index + '" playOrder="' + index + '">\n';
            content += '            <navLabel>\n';
            content += '                <text>Page ' + index + '</text>\n';
            content += '            </navLabel>\n';
            content += '            <content src="xhtml/' + page.xhtml + '"/>\n';
            content += '        </navPoint>\n';
        });
        content += '    </navMap>\n';
        content += '</ncx>\n';
        return content;
    }
}