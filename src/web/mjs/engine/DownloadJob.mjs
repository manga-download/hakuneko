export default class DownloadJob {

    // TODO: use dependency injection instead of globals for Engine.Storage, Enums
    constructor( chapter ) {
        this.id = Symbol();
        this.chapter = chapter;
        this.labels = {
            connector: chapter.manga.connector.label,
            manga: chapter.manga.title,
            chapter: chapter.title
        };
        this.requestOptions = chapter.manga.connector.requestOptions || {};
        // TODO: initialize requestOptions.headers = new Headers() if not set
        this.chunkSize = 1048576; // 1 MB
        this.throttle = ( chapter.manga.connector.config && chapter.manga.connector.config['throttle'] ? chapter.manga.connector.config['throttle'].value : 50 );
        this.status = undefined;
        this.progress = 0;
        this.errors = [];
    }

    /**
     * 
     */
    isSame( job ) {
        // comparing chapter objects works, because chapters for each manga are cached
        return ( this.chapter === job.chapter);
        //return ( this.chapter.id === job.chapter.id && this.chapter.manga.id === job.chapter.manga.id && this.chapter.manga.connector.id === job.chapter.manga.connector.id );
    }

    /**
     * Apply a new status for the job and publish the corresponding event.
     */
    setStatus( status ) {
        if( status !== this.status ) {
            this.status = status;
            this.chapter.setStatus( status );
            this.chapter.manga.updateStatus();
            document.dispatchEvent( new CustomEvent( EventListener.onDownloadStatusUpdated, { detail: this } ) );
        }
    }

    /**
     * Apply a new status for the job and publish the corresponding event.
     */
    setProgress( progress ) {
        if( progress !== this.progress ) {
            this.progress = progress;
            document.dispatchEvent( new CustomEvent( EventListener.onDownloadStatusUpdated, { detail: this } ) );
        }
    }

    /**
     *
     */
    downloadPages( directory, callback ) {
        this.setStatus( DownloadStatus.downloading );
        this.chapter.getPages( ( error, data ) => {
            if( !error && data ) {
                // manga pages
                if( data instanceof Array ) {
                    this._downloadPages( data, directory, callback );
                    return;
                }
                // anime playlist
                if( data.mirrors instanceof Array ) {
                    this._downloadPlaylistHLS( data, directory, callback );
                    return;
                }
                // anime stream
                if( typeof data.video === 'string' ) {
                    this._downloadVideoStream( data, directory, callback );
                    return;
                }
            }

            if( error ) {
                this.errors.push( error );
            } else {
                this.errors.push( new Error( 'Page list is empty' ) );
            }
            this.setStatus( DownloadStatus.failed );
            this.setProgress( 100 );
            callback();
        } );
    }

    /**
     * Return a promise that will be resolved after the given amount of time in milliseconds
     */
    _wait( time ) {
        return new Promise( ( resolve, reject ) => {
            setTimeout( resolve, time );
        } );
    }

    /**
     *
     */
    _downloadPages( pages, directory, callback ) {
        // get data for all pages of chapter
        let promises = pages.map( ( page, index ) => {
            return this._wait( index * this.throttle )
            .then( () => fetch( page, this.requestOptions ) )
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( 'Page "' + page + '" returned status: ' + response.status + ' - ' + response.statusText );
                }
                return response.blob();
            } )
            .then( data => {
                this.setProgress( this.progress + ( pages.length ? 100/pages.length : 0 ) );
                return Promise.resolve( data );
            } );
        } );
        Promise.all( promises )
        .then( values => {
            return Engine.Storage.saveChapterPages( this.chapter, values );
        } )
        .then( () => {
            this.setProgress( 100 );
            this.setStatus( DownloadStatus.completed );
            callback();
        } )
        .catch( error => {
            // TODO: abort/block all other page downloads that are still running for this job ...
            // https://stackoverflow.com/questions/31424561/wait-until-all-es6-promises-complete-even-rejected-promises
            this.errors.push( error );
            console.error( error, pages );
            this.setProgress( 100 );
            this.setStatus( DownloadStatus.failed );
            callback();
        } );
    }

    /**
     * 
     */
    _downloadPlaylistHLS( episode, directory, callback ) {
        let ffmpeg = {
            command: ['ffmpeg', '-allowed_extensions', 'ALL'],
            inputs: [],
            maps: ['-map', '0:v', '-map', '0:a'],
            metas: []
        };
        let playlistURL = undefined;
        let promises = episode.mirrors.map( mirror => {
            return fetch( mirror, this.requestOptions )
            .then( response => {
                if( response.status !== 200 ) {
                    throw new Error( 'Playlist "' + mirror + '" returned status: ' + response.status + ' - ' + response.statusText );
                }
                return response.text();
            } )
            // swap resolve and reject so we can use Promise.all to get the first "resolved" promise
            .then( data => {
                playlistURL = playlistURL || mirror;
                return Promise.reject( data );
            }, error => {
                return Promise.resolve( error );
            } );
        } );
        Promise.all( promises )
        // swap the rejected promise back to its initial resolved state
        .catch( data => Promise.resolve( data ) )
        .then( playlist => {
            // parse links
            // JavaScript matches anchors (^$) in the middle of CRLF/LFLF => exclude whitespace (\s) from beginning of line
            // See also: https://www.regular-expressions.info/anchors.html
            let packets = playlist.match( /^[^\s#].+$/gm );
            let key = playlist.match( /URI\s*=\s*"(.*?)"/ );
            if( key ) {
                packets.push( key[1] );
            }
            // modify playlist to use local files
            packets = packets.map( ( link, index ) => {
                let uri = new URL( link, playlistURL );
                // fixme: sometimes all parts have the same last path, but differes somewhere else => use hash of uri?
                let file = ( '00000' + index ).slice( -5 );
                // ffmpeg does not support backslashes => replace with slashes
                playlist = playlist.replace( link, file.replace( /\\/g, '/' ) );
                return {
                    source: uri.href,
                    target: file
                };
            } );
            ffmpeg.inputs.push( '-i', '"media.m3u8"' );
            return Engine.Storage.saveChapterFileM3U8( this.chapter, { name: 'media.m3u8', data: playlist } )
            .then( () => {
                return Promise.resolve( packets );
                } );
        } )
        // download all packets
        .then( packets => {
            let promises = packets.map( ( packet, index ) => {
                return this._wait( index * this.throttle )
                .then( () => {
                    return fetch( packet.source, this.requestOptions );
                } )
                .then( response => {
                    if( response.status !== 200 ) {
                        throw new Error( 'Packet "' + packet.link + '" returned status: ' + response.status + ' - ' + response.statusText );
                    }
                    return response.arrayBuffer();
                } )
                .then( data => {
                    return Engine.Storage.saveChapterFileM3U8( this.chapter, { name: packet.target, data: new Uint8Array( data ) } );
                } )
                .then( () => {
                    this.setProgress( this.progress + 100/packets.length );
                } );
            } );
            return Promise.all( promises );
        } )
        // download all subtitles
        .then( () => {
            let promises = episode.subtitles.map( ( subtitle, index ) => {
                let file = 'media.' + subtitle.locale + '.' + subtitle.format;
                ffmpeg.inputs.push( '-i', `"${file}"` );
                ffmpeg.maps.push( '-map', ( index + 1 ) + ':s' );
                ffmpeg.metas.push( '-metadata:s:s:' + index, 'language=' + subtitle.locale );
                // make english the default subtitle
                if( subtitle.locale.toLowerCase() === 'en-us' ) {
                    ffmpeg.metas.push( '-disposition:s:' + index, 'default' );
                }
                return this._wait( index * 50 )
                .then( () => {
                    return fetch( subtitle.url, this.requestOptions );
                } )
                .then( response => {
                    if( response.status !== 200 ) {
                        throw new Error( 'Subtitle "' + subtitle.url + '" returned status: ' + response.status + ' - ' + response.statusText );
                    }
                    return response.text();
                } )
                .then( data => {
                    return Engine.Storage.saveChapterFileM3U8( this.chapter, { name: file, data: data } );
                } );
            } );
            return Promise.all( promises );
        } )
        // multiplex
        .then( () => {
            // compose ffmpeg command for multiplexing
            let args = ffmpeg.command;
            args = args.concat( ffmpeg.inputs );
            args = args.concat( ffmpeg.maps );
            args = args.concat( ffmpeg.metas );
            args = args.concat( [ '-c', 'copy' ] );
            // multiplex media
            return Engine.Storage.muxPlaylistM3U8( this.chapter, args.join( ' ' ) );
        } )
        // finalize
        .then( () => {
            this.setProgress( 100 );
            this.setStatus( DownloadStatus.completed );
            callback();
        } )
        // process error
        .catch( error => {
            // TODO: abort/block all other packet downloads that are still running for this job ...
            // https://stackoverflow.com/questions/31424561/wait-until-all-es6-promises-complete-even-rejected-promises
            this.errors.push( error );
            console.error( error, episode );
            this.setProgress( 100 );
            this.setStatus( DownloadStatus.failed );
            callback();
        } );
    }

    /**
     * 
     */
    _downloadVideoStream( episode, directory, callback ) {
        let basename = Date.now(); // episode.video.split( '/' ).pop();
        this.requestOptions['method'] = 'HEAD';
        let request = new Request( episode.video, this.requestOptions );
        request.headers.set( 'x-referer', episode.video );
        this.requestOptions['method'] = 'GET';
        fetch( request )
        .then( response => {
            if( response.status !== 200 ) {
                throw new Error( 'Video "' + episode.video + '" returned status: ' + response.status + ' - ' + response.statusText );
            }
            //if( response.headers.get( 'Accept-Ranges' ).toLowerCase() !== 'bytes' ) {
            //    throw new Error( 'Video "' + episode.video + '" does not accept chunked download!' );
            //}
            let size = response.headers.get( 'Content-Length' );
            if( !size ) {
                throw new Error( 'Failed to determine the size of the video packet!\nThe server may not use "Access-Control-Expose-Headers: Content-Length" for CORS requests.' );
            }
            return Promise.resolve( parseInt( size ) );
        } )
        .then( size => {
            let fn = ( chunks, index, files ) => {
                index = index || 0;
                files = files || [];
                if( index >= chunks.length ) {
                    return Promise.resolve( files );
                }
                return this._wait( 0 )
                .then( () => {
                    let request = new Request( episode.video, this.requestOptions );
                    request.headers.set( 'Range', 'bytes=' + chunks[index] );
                    request.headers.set( 'x-referer', episode.video );
                    return fetch( request );
                } )
                .then( response => {
                    if( response.status !== 200 && response.status !== 206 ) {
                        throw new Error( 'Video stream "' + episode.video + '" returned status: ' + response.status + ' - ' + response.statusText );
                    }
                    return response.arrayBuffer();
                } )
                .then( data => {
                    let file = basename + '.part' + ( '00000' + index ).slice( -5 );
                    return Engine.Storage.saveVideoChunkTemp( { name: file, data: new Uint8Array( data ) } );
                } )
                .then( tempFile => {
                    this.setProgress( this.progress + 100/chunks.length );
                    return fn( chunks, index + 1, files.concat( tempFile ) );
                } );
            };
            return fn( this._splitRange( size ) );
        } )
        // multiplex
        .then( tempFiles => Engine.Storage.concatVideoChunks( this.chapter, tempFiles ) )
        // finalize
        .then( () => {
            this.setProgress( 100 );
            this.setStatus( DownloadStatus.completed );
            callback();
        } )
        // process error
        .catch( error => {
            this.errors.push( error );
            console.error( error, episode );
            this.setProgress( 100 );
            this.setStatus( DownloadStatus.failed );
            callback();
        } );
    }

    /**
     *
     */
    _splitRange( size ) {
        let part = this.chunkSize;
        let chunks = Math.ceil( size / part );
        chunks = [...(new Array( chunks )).keys()];
        chunks = chunks.map(index => {
            let start = index * part;
            let end = start + part - 1;
            return start + '-' + Math.min( end, size - 1 );
        } );
        return chunks;
    }
}