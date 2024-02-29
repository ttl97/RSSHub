const got = require('@/utils/got');
const cheerio = require('cheerio');

export const maxDuration = 30;

module.exports = async (ctx) => {
    const contentId = ctx.params.content_id;
    const { data } = await got(`https://www.vistopia.com.cn/api/v1/content/play_list?content_id=${contentId}&count=1001`, {
        headers: {
            accept: 'application/json',
        },
    });

    const content = data.data.content;
    const catalog = new Map();
    for (const c of data.data.catalogs) {
        catalog.set(c.catalog_id, c.catalog_title);
    }
    const articles = data.data.articles;
    const list = articles.map((item) => ({
        title: item.title,
        link: item.content_url,
        guid: item.article_id,
        category: catalog.get(item.catalog_id),
        // itunes_item_image: item.video_poster === undefined ? content.background_img : item.video_poster,
        itunes_item_image: item.video_poster && item.video_poster !== 'http://cdn.vistopia.com.cn/upload_img.png' ? item.video_poster : content.background_img,
        itunes_duration: item.duration,
        enclosure_url: item.media_key_full_url,
        enclosure_length: item.media_size,
        enclosure_type: 'audio/mpeg',
        comments: Number.parseInt(item.comment_count),
    }));

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const { data: response } = await got(item.link);
                const $ = cheerio.load(response);
                item.description = $('.course-content').html();
                return item;
            })
        )
    );

    ctx.state.data = {
        title: content.title,
        link: `https://www.vistopia.com.cn/detail/${contentId}`,
        language: 'zh-cn',
        image: content.background_img,
        author: content.author,
        item: items,
    };
};
