module.exports = (router) => {
    router.get('/content/article_list/:content_id/', require('./article-list'));
};
