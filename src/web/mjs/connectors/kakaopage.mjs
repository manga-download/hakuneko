import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';

export default class kakaopage extends Connector {

    constructor() {
        super();
        super.id = 'kakaopage';
        super.label = 'Page Kakao (카카오페이지) ';
        this.tags = [ 'webtoon', 'manga', 'korean' ];
        this.url = 'https://page.kakao.com';
        this.requestOptions.headers.set('x-origin', this.url);
        this.requestOptions.headers.set('x-referer', this.url);
    }

    async _getMangaFromURI(uri) {
        uri = new URL(uri);
        const request = new Request(uri, this.requestOptions);
        let id = uri.searchParams.get('seriesId') || uri.pathname.split('/').filter(part => part).pop();
        let data = await this.fetchDOM(request, 'meta[property="og:title"]', 3);
        let title = data[0].content.trim();
        return new Manga(this, id, title);
    }

    async _getMangas() {
        let msg = 'This website does not provide a manga list, please copy and paste the URL containing the images directly from your browser into HakuNeko.';
        throw new Error(msg);
    }

    async _getChapters(manga) {
        let nextCursor = '';
        const chapterList = [];
        for (let run = true; run;) {
            const data = await this._getChaptersFromPage(manga, nextCursor);

            const chapters = data.contentHomeProductList.edges.map(chapter => {
                return {
                    id : chapter.node.single.productId,
                    title : chapter.node.single.title.replace(manga.title, '').trim()
                };
            });

            nextCursor = data.contentHomeProductList.pageInfo.hasNextPage ? data.contentHomeProductList.pageInfo.endCursor : null;
            chapterList.push(...chapters);
            if (nextCursor == null) {
                run = false;
            }
        }
        return chapterList;
    }

    async _getChaptersFromPage(manga, nextCursor) {

        const gql = {
            operationName: 'contentHomeProductList',
            variables: {
                boughtOnly: false,
                seriesId : manga.id,
                sortType : 'asc',
                after : nextCursor,
            },
            query: `query contentHomeProductList(
                 $after: String
                 $before: String
                 $first: Int
                 $last: Int
                 $seriesId: Long!
                 $boughtOnly: Boolean
                 $sortType: String
               ) {
                 contentHomeProductList(
                   seriesId: $seriesId
                   after: $after
                   before: $before
                   first: $first
                   last: $last
                   boughtOnly: $boughtOnly
                   sortType: $sortType
                 ) {
                   totalCount
                   pageInfo {
                     hasNextPage
                     endCursor
                     hasPreviousPage
                     startCursor
                   }
                   selectedSortOption {
                     id
                     name
                     param
                   }
                   sortOptionList {
                     id
                     name
                     param
                   }
                   edges {
                     cursor
                     node {
                       ...SingleListViewItem
                     }
                   }
                 }
               }
               
               fragment SingleListViewItem on SingleListViewItem {
                 id
                 type
                 single {
                   productId
                   id
                   isFree
                   thumbnail
                   title
                   slideType
                 }
               }            
                `
        };
        return await this.fetchGraphQL(this.url+'/graphql', gql.operationName, gql.query, gql.variables );
    }

    async _getPages(chapter) {
        const gql = {
            operationName: 'viewerInfo',
            variables: {
                productId: chapter.id,
                seriesId : parseInt(chapter.manga.id)
            },
            query: `query viewerInfo($seriesId: Long!, $productId: Long!) {
                viewerInfo(seriesId: $seriesId, productId: $productId) {
                  viewerData {
                     ...ImageViewerData
                    __typename
                  }
                  __typename
                }
              }
              
              fragment ImageViewerData on ImageViewerData {
                type
                imageDownloadData {
                  ...ImageDownloadData
                  __typename
                }
              }
              
              fragment ImageDownloadData on ImageDownloadData {
                files {
                  ...ImageDownloadFile
                  __typename
                }
                totalCount
                totalSize
                viewDirection
                gapBetweenImages
                readType
              }
              
              fragment ImageDownloadFile on ImageDownloadFile {
                no
                size
                secureUrl
                width
                height
              }

           `
        };
        try {
            const data = await this.fetchGraphQL(this.url+'/graphql', gql.operationName, gql.query, gql.variables );
            return data.viewerInfo.viewerData.imageDownloadData.files.map(page => page.secureUrl);
        } catch( error ) {
            throw new Error('Chapter is protected '+ error);
        }
    }
}
