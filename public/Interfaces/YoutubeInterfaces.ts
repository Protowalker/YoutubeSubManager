export interface YoutubeChannel {
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
}

export interface YoutubeThumbnail {
    url: string
}