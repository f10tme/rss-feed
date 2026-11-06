import express from "express";
import rss from "./module/rss.js";
let app = new express();
const port = process.env.PORT || 5000;

rss.source = (process.env.RSS_SOURCES ? process.env.RSS_SOURCES.split(",").map((url) => url.trim()) : 
[
  "https://onedio.com/Publisher/publisher-gundem.rss",
  "https://www.bursadabugun.com/rss/?feed=haberler",
  "https://www.haberturk.com/rss",
  "https://www.ahaber.com.tr/rss/video/dunya.xml",
  "https://www.star.com.tr/rss/rss.asp",
  "https://www.trthaber.com/sondakika.rss",
  "https://feeds.bbci.co.uk/news/rss.xml",
]).sort();

app.use(express.static("public"));
app.get("/rss/full", async function (req, res) {
  res.json(await rss.multiParser(rss.source));
});

app.get("/rss/manuel/", async function (req, res) {
  res.json(await rss.parser(req.query.url));
});

app.listen(port,() => {
  console.log(`\nhttp://localhost:${port}`);
  console.log("\nOR\n");
  console.log(`http://127.0.0.1:${port}`);
});
