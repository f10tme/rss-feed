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
  for (let i = 0; i < rsssource.length; i++) {
    const url = rsssource[i];
    const parserData = await parser.parseURL(url);
    parserData.source_url = url;
    parserData.source_id = i + 1;
    parserData.items.sort((a, b) => {
      const dateA = new Date(a.pubDate || a.isoDate);
      const dateB = new Date(b.pubDate || b.isoDate);
      return dateB - dateA;
    });
    rssdata.push(parserData);
  }
  return rssdata;
};

export default rss;
