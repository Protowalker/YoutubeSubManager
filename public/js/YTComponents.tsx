import React, { useState } from 'react';
import {Box, Grid, Container, makeStyles} from '@material-ui/core';
import useSWR from 'swr';
import {promisify} from 'util';
import Image from 'material-ui-image';
import lodash from 'lodash';


interface YoutubeChannel {
    etag: string,
    id: string,
    kind: string,
    contentDetails: {
        relatedPlaylists: {
            likes: string,
            favorites: string,
            uploads: string
        }
    }
    snippet: {
        title: string
        channelId: string,
        description: string,
        publishedAt: string,
        resourceId: {
            channelId: string,
            kind: string
        },
        thumbnails: {
            default: YoutubeThumbnail,
            high: YoutubeThumbnail,
            medium: YoutubeThumbnail
        }
    },
    most_recent_videos: Video[],
    last_watched_video: Video
}

const style = {
    item: {
        width: '1rem',
        height: '1rem',
    }
};

interface YoutubeThumbnail {
    url: string
}

export class YoutubeChannelListing extends React.Component<{channel: YoutubeChannel}, {subscribed: boolean}> {
    constructor(props: {channel: YoutubeChannel}) {
        super(props);
        
        this.state = {
            subscribed: true
        };
    }
    
    render() {        
        return (
            <>

                <Grid container item alignItems="center">
                    <Grid item>
                        <Image src={this.props.channel.snippet.thumbnails.default.url} />
                        <style jsx>{`
                            border-radius: 100%;
                            scale: 75%;
                        `}
                        </style>
                    </Grid>
                    <YoutubeVideo video={this.props.channel.most_recent_videos[0]}/>
                    <YoutubeVideo video={this.props.channel.most_recent_videos[1]}/>
                    <YoutubeVideo video={this.props.channel.most_recent_videos[2]}/>
             
                </Grid>
            </>
        );
    }
}

export function YoutubeVideo(props: {video: Video}): React.ReactElement {
    return <Grid item>
        </Grid>;
}



export function YoutubeChannelListings(props: {isLoggedIn: boolean}): React.ReactElement {

    if(typeof window === 'undefined')
        return null;

    if(props.isLoggedIn !== true) return null;


    const {subscriptions, isLoading, isError} = useSubscriptions();

    if(isLoading) return <p>loading</p>;
    if(isError) return <p>error</p>;

    
    return (
        <Grid container direction="column">
            {subscriptions.map(sub => 

            <YoutubeChannelListing key={sub.id} channel={sub}></YoutubeChannelListing>
            )}
        </Grid>
    );
}


const subscriptionFetcher = async (...args): Promise<YoutubeChannel[]> => {
    if(typeof gapi.client === 'undefined')
        await promisify(gapi.load)("client");
    if(typeof gapi.client['youtube'] === 'undefined')
        await gapi.client.load('youtube', 'v3');

    let page = await gapi.client['youtube'].subscriptions.list({
        "part": [
            "snippet",
            "contentDetails"
        ],
        maxResults: "50",
        "mine": true,
    });
    page = page.result;
    if (page !== undefined) {
        let subs: Array<YoutubeChannel> = page.items;
        while (page.nextPageToken !== undefined) {
            page = await gapi.client['youtube'].subscriptions.list({
                "part": [
                    "snippet",
                    "contentDetails"
                ],
                order: "alphabetical",
                maxResults: "50",
                pageToken: page.nextPageToken,
                "mine": true,
            });
            page = page.result;
            subs = subs.concat(page.items);
        }

        subs = lodash.uniqBy(subs, sub => sub['id']);
        for(let sub of subs) {
            let most_recent_videos = await getRecentVideos(sub.contentDetails.relatedPlaylists.uploads);
            sub.most_recent_videos = most_recent_videos;
        }
        return subs;
    }

};

interface Video {
    publishedAt: string,
    channelId: string,
    title: string,
    description: string,
    thumbnails: {
        default: YoutubeThumbnail,
        high: YoutubeThumbnail,
        medium: YoutubeThumbnail
    },
    channelTitle: string,
    liveBroadcastContent: string
}

async function getRecentVideos(uploadsId: string): Promise<Array<Video>> {

    let result = await gapi.client['youtube'].playlistItems({part: ["snippet"], playlistId: uploadsId});
    if(result !== undefined) {
        let items = result.result.items;
        return items.map(i => i.snippet);
    }
    return null;
}


function useSubscriptions(): {subscriptions: Array<YoutubeChannel>, isLoading: boolean, isError: Error} {
    const { data, error, mutate} = useSWR("/", subscriptionFetcher, {
        revalidateOnFocus: false,
        revalidateOnMount: true,
        revalidateOnReconnect: false,
        refreshInterval: 0,
        refreshWhenHidden: false,
        refreshWhenOffline: false
    });


    return {
      subscriptions: data,
      isLoading: !error && !data,
      isError: error
    };
}