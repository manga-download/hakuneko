import Connector from '../engine/Connector.mjs';
import Manga from '../engine/Manga.mjs';
export default class kakaopage extends Connector {
    constructor() {
        super();
        super.id = 'kakaopage';
        super.label = 'Page Kakao (카카오페이지) ';
        this.tags = [ 'webtoon', 'manga', 'korean' ];
        this.url = 'https://page.kakao.com';
        this.api = 'https://page.kakao.com/graphql';
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
        let gql = {
            operationName: 'contentHomeProductList',
            variables: {
                boughtOnly: false,
                seriesId: manga.id
            },
            query: `query contentHomeProductList($after: String, $before: String, $first: Int, $last: Int, $seriesId: Long!, $boughtOnly: Boolean, $sortType: String) {
                contentHomeProductList( seriesId: $seriesId after: $after before: $before first: $first last: $last boughtOnly: $boughtOnly sortType: $sortType ) {
                    totalCount pageInfo {
                    hasNextPage endCursor hasPreviousPage startCursor __typename }
                    selectedSortOption {
                    id name param __typename }
                    sortOptionList {
                    id name param __typename }
                    edges {
                        cursor node {
                        ...SingleListViewItem __typename }
                    __typename }
                __typename }
            }
            fragment SingleListViewItem on SingleListViewItem {
                id type thumbnail showPlayerIcon isCheckMode isChecked scheme row1 {
                badgeList title __typename }
                row2 row3 single {
                    productId ageGrade id isFree thumbnail title slideType operatorProperty {
                    isTextViewer __typename }
                __typename }
                isViewed purchaseInfoText eventLog {
                ...EventLogFragment __typename }
            }
            fragment EventLogFragment on EventLog {
                click {
                layer1 layer2 setnum ordnum copy imp_id imp_provider __typename }
                eventMeta {
                id name subcategory category series provider series_id type __typename }
                viewimp_contents {
                type name id imp_area_ordnum imp_id imp_provider imp_type layer1 layer2 __typename }
                customProps {
                landing_path view_type toros_imp_id toros_file_hash_key toros_event_meta_id content_cnt event_series_id event_ticket_type play_url banner_uid __typename }
            }
            `
        };
        let data = await this.fetchGraphQL(this.api, gql.operationName, gql.query, gql.variables );

        return data.contentHomeProductList.edges.map(element => ({
               title : element.node.row1.title ,
               id : '/content/'+manga.id+'/viewer/'+element.node.single.productId
        })).reverse();

    }

 async _getPages(chapter) {
         let gql = {
            operationName: 'viewerInfo',
            variables: {
                seriesId:   chapter.id.match(/\/content\/([0-9]+)/)[1],
                productId : chapter.id.match(/\/viewer\/([0-9]+)/)[1]
            },
            query: `query viewerInfo($seriesId: Long!, $productId: Long!) {
                viewerInfo(seriesId: $seriesId, productId: $productId) {
                    item {
                    ...SingleFragment __typename }
                    seriesItem {
                    ...SeriesFragment __typename }
                    prevItem {
                    ...NearItemFragment __typename }
                    nextItem {
                    ...NearItemFragment __typename }
                    viewerData {
                    ...TextViewerData ...TalkViewerData ...ImageViewerData ...VodViewerData __typename }
                    displayAd {
                    ...DisplayAd __typename }
                __typename }
            }
            fragment SingleFragment on Single {
                id productId seriesId title thumbnail badge isFree ageGrade state slideType lastReleasedDate size pageCount isHidden freeChangeDate isWaitfreeBlocked saleState series {
                ...SeriesFragment __typename }
                serviceProperty {
                ...ServicePropertyFragment __typename }
                operatorProperty {
                ...OperatorPropertyFragment __typename }
                assetProperty {
                ...AssetPropertyFragment __typename }
            }
            fragment SeriesFragment on Series {
                id seriesId title thumbnail categoryUid category subcategoryUid subcategory badge isAllFree isWaitfree isWaitfreePlus is3HoursWaitfree ageGrade state onIssue seriesType businessModel authors pubPeriod freeSlideCount lastSlideAddedDate waitfreeBlockCount waitfreePeriodByMinute bm saleState serviceProperty {
                ...ServicePropertyFragment __typename }
                operatorProperty {
                ...OperatorPropertyFragment __typename }
                assetProperty {
                ...AssetPropertyFragment __typename }
            }
            fragment ServicePropertyFragment on ServiceProperty {
                viewCount readCount ratingCount ratingSum commentCount pageContinue {
                ...ContinueInfoFragment __typename }
                todayGift {
                ...TodayGift __typename }
                waitfreeTicket {
                ...WaitfreeTicketFragment __typename }
                isAlarmOn isLikeOn ticketCount purchasedDate lastViewInfo {
                ...LastViewInfoFragment __typename }
                purchaseInfo {
                ...PurchaseInfoFragment __typename }
            }
            fragment ContinueInfoFragment on ContinueInfo {
            title isFree productId lastReadProductId scheme continueProductType hasNewSingle hasUnreadSingle}
            fragment TodayGift on TodayGift {
            id uid ticketType ticketKind ticketCount ticketExpireAt isReceived}
            fragment WaitfreeTicketFragment on WaitfreeTicket {
            chargedPeriod chargedCount chargedAt}
            fragment LastViewInfoFragment on LastViewInfo {
            isDone lastViewDate rate spineIndex}
            fragment PurchaseInfoFragment on PurchaseInfo {
            purchaseType rentExpireDate}
            fragment OperatorPropertyFragment on OperatorProperty {
            thumbnail copy torosImpId torosFileHashKey isTextViewer}
            fragment AssetPropertyFragment on AssetProperty {
            bannerImage cardImage cardTextImage cleanImage ipxVideo}
            fragment NearItemFragment on NearItem {
            productId slideType ageGrade isFree title thumbnail}
            fragment TextViewerData on TextViewerData {
                type atsServerUrl metaSecureUrl contentsList {
                chapterId contentId secureUrl __typename }
            }
            fragment TalkViewerData on TalkViewerData {
                type talkDownloadData {
                dec host path talkViewerType __typename }
            }
            fragment ImageViewerData on ImageViewerData {
                type imageDownloadData {
                ...ImageDownloadData __typename }
            }
            fragment ImageDownloadData on ImageDownloadData {
                files {
                ...ImageDownloadFile __typename }
            totalCount totalSize viewDirection gapBetweenImages readType}
            fragment ImageDownloadFile on ImageDownloadFile {
            no size secureUrl width height}
            fragment VodViewerData on VodViewerData {
                type vodDownloadData {
                contentId drmType endpointUrl width height duration __typename }
            }
            fragment DisplayAd on DisplayAd {
            sectionUid bannerUid treviUid momentUid}
            `
        };
        let data = await this.fetchGraphQL(this.api, gql.operationName, gql.query, gql.variables );
        return data.viewerInfo.viewerData.imageDownloadData.files.map(element => {
           return  element.secureUrl
          
        });
 }
}
