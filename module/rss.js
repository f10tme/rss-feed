import Parser from "rss-parser";
let parser = new Parser();
let rss = {
    source: [],
};

rss.parser = async function (rsssource) {
    let feed = await parser.parseURL(rsssource);
    return feed;
};

rss.multiParser = async function (rsssource = rss.source) {
    let rssdata = [];
    for (let i = 0;i < rsssource.length;i++) {
        rssdata.push(await parser.parseURL(rsssource[i]));
    }
    return rssdata;
};

export default rss;