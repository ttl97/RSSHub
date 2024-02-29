module.exports = (router) => {
    router.get('/content/play_list/:content_id/', require('./play-list'));
};
