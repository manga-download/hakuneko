export default class ComicInfoGenerator {
    createComicInfoXML(series, title, pagesCount) {
        series = this.escapeXML(series);
        title = this.escapeXML(title);
        return `<?xml version="1.0" encoding="utf-8"?>
<ComicInfo xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <Title>${title}</Title>
    <Series>${series}</Series>
    <PageCount>${pagesCount}</PageCount>
</ComicInfo>`;
    }

    escapeXML(str) {
        const symbols = {
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            '\'': '&apos;',
            '"': '&quot;'
        };

        return str.replace(/[<>&'"]/g, function (c) {
            return symbols[c];
        });
    }
}
