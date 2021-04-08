const ghPages = process.env.DEPLOY_TARGET === 'gh-pages';

module.exports = {
    images: {
        domains: ['yt3.ggpht.com'],
    },
    assetPrefix: ghPages ? '/YoutubeSubManager/' : '',
    basePath: ghPages ? '/YoutubeSubManager' : ''
}