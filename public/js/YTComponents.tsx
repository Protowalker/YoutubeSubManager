import React, {useState} from 'react';
import {Box, Grid, Container, makeStyles} from '@material-ui/core';
import useSWR from 'swr';
import {promisify} from 'util';
import lodash from 'lodash';


interface YoutubeChannel {
    etag: string,
    id: string,
    kind: string,
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
        if(!this.props.channel.most_recent_videos)
            return null;

        return (
            <>

                <Grid container alignItems="center" spacing={3}>
                    <Grid item xs={1}>
                        <img src={this.props.channel.snippet.thumbnails.default.url} />
                        <style jsx>{`
                            border-radius: 100%;
                            scale: 75%;
                        `}
                        </style>
                    </Grid>
                    <Grid container direction="column" alignItems="center">
                        <Grid container direction="row" spacing={1}>
                            <YoutubeVideo video={this.props.channel.most_recent_videos[0]}/>
                            <YoutubeVideo video={this.props.channel.most_recent_videos[1]}/>
                            <YoutubeVideo video={this.props.channel.most_recent_videos[2]}/>
                        </Grid>
                        <p>Most Recent Videos</p>
                    </Grid>
             
                </Grid>
            </>
        );
    }
}

export function YoutubeVideo(props: {video: Video}): React.ReactElement {
    if(props.video == undefined)
        return null;

    return <Grid item>
            <img src={props.video.thumbnails.default.url} />
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

let hasBeenCalled = false;

const subscriptionFetcher = async (...args): Promise<YoutubeChannel[]> => {
    if(hasBeenCalled)
        return [];
        
    console.log("this got called");
    if(typeof gapi.client === 'undefined')
        await promisify(gapi.load)("client");
    if(typeof gapi.client['youtube'] === 'undefined')
        await gapi.client.load('youtube', 'v3');

    let page = await gapi.client['youtube'].subscriptions.list({
        "part": [
            "snippet",
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
        let promises = [];
        for(let sub of subs) {
            let promise = async () => {
                let uploads = await getUploads(sub.snippet.resourceId.channelId);
                let most_recent_videos = await getRecentVideos(uploads);
                sub.most_recent_videos = most_recent_videos;
                };
            promises.push(promise());
        }
        await Promise.allSettled(promises);
        hasBeenCalled = true;
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
    resourceId: {
        kind: string,
        videoId: string
    }
    channelTitle: string,
    liveBroadcastContent: string
}

async function getUploads(channelId: string): Promise<string> {
    let channel = await gapi.client['youtube'].channels.list({
        part: ['contentDetails'],
        id: channelId
    });
    return channel.result.items[0].contentDetails.relatedPlaylists.uploads;
}

async function getRecentVideos(uploadsId: string): Promise<Array<Video>> {

    let result = await gapi.client['youtube'].playlistItems.list({part: ["snippet"], playlistId: uploadsId});
    if(result !== undefined) {
        let items = result.result.items;
        return items.map(i => i.snippet);
    }
    return [null, null, null];
}


function useSubscriptions(): {subscriptions: Array<YoutubeChannel>, isLoading: boolean, isError: Error} {
    const { data, error, mutate} = useSWR("/", subscriptionFetcher, {
        revalidateOnFocus: false,
        revalidateOnMount: true,
        revalidateOnReconnect: false,
        refreshInterval: 0,
        refreshWhenHidden: false,
        refreshWhenOffline: false,
        isPaused: () => hasBeenCalled
    });


    if(error)
        console.error(error);
    return {
      subscriptions: data,
      isLoading: !error && !data,
      isError: error
    };
}