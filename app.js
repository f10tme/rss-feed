import express from "express";
import rss from "./module/rss.js";
let app = new express();

rss.source = [
    "https://www.bursadabugun.com/rss/?feed=haberler",
    "https://www.ensonhaber.com/rss/ensonhaber.xml",
    "https://www.haberturk.com/rss",
    "https://www.ahaber.com.tr/rss/video/dunya.xml",
    "https://www.star.com.tr/rss/rss.asp",
    "https://www.trthaber.com/sondakika.rss",
].sort();


app.use(express.static("public"));
app.get("/rss/full",async function (req,res) {
    res.json(await rss.multiParser(rss.source));
});

app.get("/rss/manuel/",async function (req,res) {
    res.json(await rss.parser(req.query.url));
});



app.listen(80);