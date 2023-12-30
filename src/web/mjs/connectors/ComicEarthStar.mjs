import CoreView from './templates/CoreView.mjs';

export default class ComicEarthStar extends CoreView {

    constructor() {
        super();
        super.id = 'comicearthstar';
        super.label = 'コミック アース・スター (Comic Earth Star)';
        this.tags = [ 'manga', 'japanese' ];
        this.apiURL = 'https://comic-earthstar.com/graphql';
        this.url = 'https://comic-earthstar.com';
    }

    async _getMangas() {
        const mangalist = [];

        let operationName = 'Earthstar_Oneshot';
        let query = `
            query Earthstar_Oneshot {
                seriesOneshot: serialGroup(groupName: "連載・読切：読切作品") {
                    seriesSlice {
                        seriesList {
                            id
                            title
                            firstEpisode {
                                permalink
                            }
                        }
                    }
                }
            }
        `;
        let uri = new URL(this.apiURL);
        uri.searchParams.set('opname', operationName);
        let request = new Request(uri, this.requestOptions);
        let data = await this.fetchGraphQL(request, operationName, query, {} );
        data.seriesOneshot.seriesSlice.seriesList.forEach(manga => {
            mangalist.push({
                id: new URL(manga.firstEpisode.permalink).pathname,
                title: manga.title.trim()
            });
        });

        operationName = 'Earthstar_Series';
        query = `
            query Earthstar_Series {
                seriesOngoing: serialGroup(groupName: "連載・読切：連載作品：連載中") {
                    seriesSlice {
                        seriesList {
                            ...Earthstar_SeriesListItem_Series
                        }
                    }
                }
                seriesFinished: serialGroup(groupName: "連載・読切：連載作品：連載終了") {
                    seriesSlice {
                        seriesList {
                            ...Earthstar_SeriesListItem_Series
                        }
                    }
                }
            }
            
            fragment Earthstar_SeriesListItem_Series on Series {
                id
                title
                firstEpisode {
                    permalink
                }
            }
        `;
        uri = new URL(this.apiURL);
        uri.searchParams.set('opname', operationName);
        request = new Request(uri, this.requestOptions);
        data = await this.fetchGraphQL(request, operationName, query, {} );

        data.seriesOngoing.seriesSlice.seriesList.forEach(manga => {
            mangalist.push({
                id: new URL(manga.firstEpisode.permalink).pathname,
                title: manga.title.trim()
            });
        });

        data.seriesFinished.seriesSlice.seriesList.forEach(manga => {
            mangalist.push({
                id: new URL(manga.firstEpisode.permalink).pathname,
                title: manga.title.trim()
            });
        });

        return mangalist;

    }

}
