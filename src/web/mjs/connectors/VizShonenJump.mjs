import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class VizShonenJump extends Connector {

    constructor() {
        super();
        super.id = 'vizshonenjump';
        super.label = 'Viz - Shonen Jump';
        this.tags = [ 'manga', 'english' ];
        this.url = 'https://www.viz.com/shonenjump';
        this.requestOptions.headers.set( 'x-referer', this.url );
    }

    async _getMangas() {
        const request = new Request(new URL(this.url), this.requestOptions);
        const data = await this.fetchDOM(request, 'div.o_sort_container div > a');

        return data.map(manga => {
            return {
                id: manga.pathname,
                title: manga.querySelector(':nth-child(2)').innerText.trim()
            }
        });
    }

    async _getChapters(manga) {
        const request = new Request(new URL(manga.id, this.url), this.requestOptions);
        let data = await this.fetchDOM(request, 'a.o_chapter-container');
        data = data.filter(chapter => chapter.innerText.includes('FREE'));

        return data.map(chapter => {
            try {
                return {
                    id: chapter.href,
                    title: chapter.querySelector('.disp-id').innerText.trim()
                }
            } catch(error) {
                try {
                    return {
                        id: chapter.href,
                        title: 'Ch. ' + chapter.href.match(/chapter\-(\d+)\//)[1]
                    }
                } catch(error) {
                    throw new Error('Unknown chapter format. Please report at https://github.com/manga-download/hakuneko/issues');
                }
            }
        });
    }

    async _getPages(chapter) {
        chapter.id = chapter.id.replace('hakuneko://cache/shonenjump', this.url)
        console.log(chapter);
        let script = `
            new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        window.debugLogger = function debugLogger(msg) {
                            console.log(msg);
                        }

                        window.loadPages = function loadPages() {
                            var aj_images = [];
                            for (var page_count = 0; page_count <= pages; page_count++) 
                                if (!(page_count < 0 || page_count > pages) && "undefined" == typeof pageImages["page" + page_count]) {
                                    var aj_req = $.ajax({
                                        url: pageUrl + "&manga_id=" + manga_id + "&page=" + page_count,
                                        dataType: "text"
                                    });
                                    aj_images.push(aj_req)
                                } $.when.apply($, aj_images).done(function() {
                                for (page_count = 0; page_count < aj_images.length; page_count++) {
                                    var page_no, page_array = /\/([0-9]+)\.jpg/.exec(aj_images[page_count].responseText);
                                    page_array && (page_no = page_array[1], pageList["page" + page_no] = aj_images[page_count].responseText)
                                }
                                preloadImages();
                            })
                        }
                        
                        window.preloadImages = function preloadImages() {
                            for (var count = 0; count <= pages; count++) {
                                "undefined" == typeof pageImages["page" + count] && function(count, pageList_page) {
                                    var xhr = new XMLHttpRequest;
                                    if (xhr.onloadend = function(count) {
                                            return function() {
                                                var image = new Image;
                                                image.crossOrigin = "Anonymous", image.onload = function(count) {
                                                    return function() {
                                                        pageImages["page" + count] = image;
                                                    }
                                                }(count);
                        
                                                var exif = EXIF.readFromBinaryFile(this.response),
                                                    exif_id = "",
                                                    exif_width = metadata.width,
                                                    exif_height = metadata.height;
                        
                                                exif.ImageUniqueID && (exif_id = exif.ImageUniqueID, exif_width = exif.ImageWidth, exif_height = exif.ImageHeight);
                        
                                                var data = new DataView(this.response),
                                                    blob = new Blob([data], {
                                                        type: "image/jpeg"
                                                    });
                        
                                                pageKeys["page" + count] = {
                                                    key: exif_id,
                                                    width: exif_width,
                                                    height: exif_height,
                                                    size: blob.size
                                                };
                        
                                                var blob_uri = (window.URL || window.webkitURL).createObjectURL(blob);
                                                image.src = blob_uri;
                                            }
                                        }(count), xhr.onerror = function() {
                                            throw "There was an XHR error!";
                                        }, "string" != typeof pageList_page) throw "url is NOT a string!";
                                    xhr.open("GET", pageList_page, !0), xhr.responseType = "arraybuffer", xhr.send()
                                }(count, pageList["page" + count]);
                            }
                            resolve([pageImages, pageKeys]);
                        }

                        setTimeout(() => {
                            loadPages();
                        }, 2000);

                    } catch(error) {
                        reject(error);
                    }
                }, 3000);
            });
        `;
        let request = new Request(new URL(chapter.id, this.url));
        let data = await Engine.Request.fetchUI(request, script);
        console.log(data);
    }

    async _handleConnectorURI(payload) {

    }

    async _canvasToBlob(canvas) {
        return new Promise(resolve => {
            canvas.toBlob(data => {
                resolve(data);
            }, Engine.Settings.recompressionFormat.value, parseFloat(Engine.Settings.recompressionQuality.value)/100);
        });
    }

    async _getMangaFromURI(uri) {

    }
}