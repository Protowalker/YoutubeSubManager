const ghPages = process.env.DEPLOY_TARGET === 'gh-pages';

module.exports = {
    images: {
        domains: ['yt3.ggpht.com'],
    },
    basePath: ghPages ? '/YoutubeSubManager' : ''
};