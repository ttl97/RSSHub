module.exports = (router) => {
    router.get('/play_list/:content_id', require('./play-list'));
};
