<link rel="import" href="wp-madara.html">

<script>

    /**
     * 
     */
    class MangaYosh extends WordPressMadara {

        /**
         *
         */
        constructor() {
            super();
            super.id         = 'mangayosh';
            super.label      = 'MangaYosh';
            this.tags        = [ 'manga', 'indonesian' ];
            this.url         = 'https://mangayosh.com';
        }

        /**
         *
         */
        _getChapterList( manga, callback ) {
            super._getChapterList( manga, ( error, chapterList ) => {
                if( !error && chapterList ) {
                    chapterList.forEach( chapter => chapter.id = this._decryptChapterID( chapter.id ) );
                }
                callback( error, chapterList );
            } );
        }

        /**
         *
         */
        _decryptChapterID( chapterID ) {
            if( chapterID.includes( 'subetenews.com' ) ) {
                return this._decryptSubeteNews( chapterID );
            }
            if( chapterID.includes( 'l.wl.co' )  ) {
                return this._decryptWL( chapterID );
            }
            return this.getRootRelativeOrAbsoluteLink( chapterID, this.url );
        }

        /**
         *
         */
        _decryptSubeteNews( chapterID ) {
            let uri = new URL( chapterID, this.url );
            let link = atob( uri.searchParams.get( 'r' ) );
            return this._decryptChapterID( link );
        }

        /**
         *
         */
        _decryptWL( chapterID ) {
            let uri = new URL( chapterID, this.url );
            let link = uri.searchParams.get( 'u' );
            return this._decryptChapterID( link );
        }
    }

</script>