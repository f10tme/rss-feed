const rssContainer = document.getElementById("rss-container");
const sourceList = document.getElementById("source-list");
const sourceListContent = sourceList.querySelector("#source-list-content");
const feedList = document.getElementById("feed-list");
const feedListContent = feedList.querySelector("#feed-list-content");
const notificationList = document.getElementById("notification-list");
const notificationListContent = notificationList.querySelector(
  "#notification-list-content"
);
const notificationControButton = document.getElementById(
  "notification-control-button"
);

let rss = {
  config: {
    refreshTime: 6 * 10000,
    lastData: null,
    previousData: null,
    selectedSource: null,
    notificationFullData: [],
  },
  tool: {
    elapsedTime: null,
    dateNewest: null,
    getTime: null,
  },
  api: null,
  sourceListItemCreate: null,
  feedListItemCreate: null,
  notificationListItemNotifyCreate: null,
  notificationListItemCreate: null,
  notify: null,
  selectedButtonUpdate: null,
  sourceWrite: null,
  control: null,
};

// ANCHOR: Elapsed Time
rss.tool.elapsedTime = function (date) {
  const d = new Date(date),
    now = new Date();
  const diff = now - d;

  if (diff < 0) return "Hatalı Tarih (Gelecek)";

  const mins = diff / 60000,
    hrs = diff / 3600000,
    days = diff / 86400000,
    weeks = days / 7;

  return mins < 1
    ? "Az önce"
    : mins < 60
    ? `${Math.floor(mins)} dakika önce`
    : hrs < 24
    ? `${Math.floor(hrs)} saat önce`
    : days < 7
    ? `${Math.floor(days)} gün önce`
    : weeks < 4
    ? `${Math.floor(weeks)} hafta önce`
    : d.toLocaleString("tr-TR");
};

// ANCHOR: Date Newest
rss.tool.dateNewest = function (items) {
  return items.sort((a, b) => {
    const dateA = new Date(a.isoDate || a.pubDate);
    const dateB = new Date(b.isoDate || b.pubDate);
    return dateB - dateA; // Büyük olan (yeni tarih) önce gelsin
  });
};

// ANCHOR: Get Time
rss.tool.getTime = function () {
  return new Date().toLocaleTimeString("tr-TR", { hour12: false });
};

// ANCHOR: Is Valid Url
rss.tool.isValidUrl = function (url) {
  return url.test(new RegExp("^(https?:\\/\\/)?.+", "i"));
};

// ANCHOR: Get Full Data Api
rss.api = async function () {
  rss.config.lastData = await (
    await fetch("/rss/full", { cache: "no-store" })
  ).json();
  return rss.config.lastData;
};

// ANCHOR: Source List Item Create
rss.sourceListItemCreate = function (info, image, sourceName, clickEvent) {
  const config = {
    info: info || "Başlık Bulunamadı",
    image: image || "null-icon.png",
    errorImage: "null-icon.png",
    sourceName: sourceName || "<i>Tespit Edilemedi</i>",
    clickEvent:
      clickEvent ||
      function () {
        alert("Butona Tıkladınız!");
      },
  };

  const sourceListItem = {
    element: document.createElement("div"),
    imageBox: document.createElement("div"),
    image: document.createElement("img"),
    sourceName: document.createElement("span"),
    init(config) {
      this.element.setAttribute("id", "source-list-item");
      this.element.setAttribute("title", config.info);
      this.element["source_url"] = config.info;
      this.element.onclick = function (...args) {
        config.clickEvent(sourceListItem.element, ...args);
      };
      this.imageBox.setAttribute("id", "image-box");
      this.image.alt = config.info;
      this.image.src = config.image;
      this.image.onerror = () => {
        this.image.src = config.errorImage;
      };
      this.sourceName.setAttribute("id", "source-name");
      this.sourceName.innerHTML = config.sourceName;
      this.element.appendChild(this.imageBox);
      this.imageBox.appendChild(this.image);
      this.element.appendChild(this.sourceName);
    },
  };
  sourceListItem.init(config);
  return { ...sourceListItem };
};

// ANCHOR: feed List Item Create
rss.feedListItemCreate = function (
  heading,
  description,
  elapsedTime,
  buttonLink,
  buttonText
) {
  const config = {
    heading: heading || "Başlık Bulunamadı",
    description: description || "Açıklama Bulunamadı",
    elapsedTime: elapsedTime || "Geçen Zaman Bulunamadı",
    buttonLink: buttonLink || "#nonebuttonlink",
    buttonText: buttonText || "Buton Metni Bulunamadı",
  };

  const feedListItem = {
    element: document.createElement("div"),
    heading: document.createElement("b"),
    description: document.createElement("span"),
    elapsedTime: document.createElement("span"),
    openButton: document.createElement("a"),
    init(config) {
      this.element.setAttribute("id", "feed-list-item");
      this.heading.setAttribute("id", "heading");
      this.heading.innerHTML = config.heading;
      this.description.setAttribute("id", "description");
      this.description.innerHTML = config.description;
      this.elapsedTime.setAttribute("id", "elapsed-time");
      this.elapsedTime.innerHTML = config.elapsedTime;
      this.openButton.setAttribute("id", "open-button");
      this.openButton.setAttribute("href", config.buttonLink);
      this.openButton.setAttribute("target", "_blank");
      this.openButton.innerHTML = config.buttonText;
      this.element.appendChild(this.heading);
      this.element.appendChild(this.description);
      this.element.appendChild(this.elapsedTime);
      this.element.appendChild(this.openButton);
    },
  };
  feedListItem.init(config);
  return { ...feedListItem };
};

// ANCHOR: Notification List Item Notify Create
rss.notificationListItemNotifyCreate = function (
  sourceHead,
  heading,
  buttonLink,
  buttonText
) {
  const config = {
    sourceHead: sourceHead || "Kaynak Bulunamadı",
    heading: heading || "Başlık Bulunamadı",
    buttonLink: buttonLink || "#nonebuttonlink",
    buttonText: buttonText || "Buton Metni Bulunamadı",
  };

  const notificationListItemNotify = {
    element: document.createElement("div"),
    sourceHead: document.createElement("span"),
    heading: document.createElement("span"),
    openButton: document.createElement("a"),
    init(config) {
      this.element.setAttribute("id", "notify");
      this.sourceHead.setAttribute("id", "source-head");
      this.sourceHead.innerHTML = config.sourceHead;
      this.heading.setAttribute("id", "heading");
      this.heading.innerHTML = config.heading;
      this.openButton.setAttribute("id", "open-button");
      this.openButton.setAttribute("href", config.buttonLink);
      this.openButton.setAttribute("target", "_blank");
      this.openButton.innerHTML = config.buttonText;
      this.element.appendChild(this.sourceHead);
      this.element.appendChild(this.heading);
      this.element.appendChild(this.openButton);
    },
  };
  notificationListItemNotify.init(config);
  return { ...notificationListItemNotify };
};

// ANCHOR: Notification List Item Create
rss.notificationListItemCreate = function (shareTime, notificationData) {
  const config = {
    shareTime: shareTime || "Tarih Bulunamadı",
    notificationData: notificationData || [],
  };

  const notificationListItem = {
    element: document.createElement("div"),
    shareTime: document.createElement("span"),
    init(config) {
      this.element.setAttribute("id", "notification-list-item");
      this.shareTime.setAttribute("id", "share-time");
      this.shareTime.innerHTML = config.shareTime;
      this.element.appendChild(this.shareTime);
      config.notificationData.forEach((event, length) => {
        notificationListItem.element.appendChild(
          rss.notificationListItemNotifyCreate(
            event.sourceHead,
            event.heading,
            event.buttonLink,
            event.buttonText
          ).element
        );
      });
    },
  };

  notificationListItem.init(config);
  return { ...notificationListItem };
};

// ANCHOR: Notification Audio
rss.notify = function () {
  new Audio("notify.mp3").play();
};

// ANCHOR: Selected Button Update
rss.selectedButtonUpdate = function () {
  sourceListContent
    .querySelectorAll("#source-list-item")
    .forEach((event, length) => {
      if (event.source_url == rss.config.selectedSource)
        event.classList.add("selected");
    });
};

// ANCHOR: Source Write
rss.sourceWrite = function (data) {
  sourceListContent.innerHTML = "";
  data.forEach((event, length) => {
    sourceListContent.appendChild(
      rss.sourceListItemCreate(
        event.source_url,
        event?.image?.url,
        event.title,
        function (element) {
          sourceListContent
            .querySelectorAll("#source-list-item")
            .forEach((event, length) => event.classList.remove("selected"));
          element.classList.add("selected");

          rss.config.selectedSource = element.source_url;

          feedListContent.innerHTML = "";
          rss.feedWrite(data, element["source_url"]);
        }
      ).element
    );
  });
};

// ANCHOR: Feed Write
rss.feedWrite = function (data, source_url) {
  rss.tool.dateNewest(data).forEach((event, length) => {
    if (event.source_url == source_url) {
      event.items.forEach((e, len) => {
        feedListContent.appendChild(
          rss.feedListItemCreate(
            e.title,
            e.content,
            rss.tool.elapsedTime(e.isoDate || e.pubDate),
            e.link || e.guid,
            "Haberi Aç"
          ).element
        );
      });
    }
  });
};

// ANCHOR: notification
rss.notification = function () {
  let notificationData = [];
  if (rss.config.previousData == null) {
    rss.config.previousData = rss.config.lastData;
  }
  function complier(data) {
    let xyz = [];
    data.forEach((event, length) => {
      event.source_url;
      event.source_id;
      event.items.forEach((e, len) => {
        xyz.push({
          id: event.source_id,
          url: event.source_url,
          source: event.title,
          len,
          data: e,
        });
      });
    });
    return xyz;
  }

  function scan(previousData, newData) {
    previousData.forEach((event, length) => {
      let item = newData[length];
      let currentDate = new Date();
      let itemDate = new Date(item.data.pubDate || item.data.isoDate);
      if (
        (item.data.link || item.data.guid) !=
          (event.data.link || event.data.guid) &&
        currentDate - itemDate <= 5 * 60 * 1000
      ) {
        const isMatch = rss.config.notificationFullData.some(
          (e) =>
            (e.data.link || e.data.guid) === (item.data.link || item.data.guid)
        );
        if (!isMatch) {
          notificationData.push(item);
          rss.config.notificationFullData.push(item);
        }
      }
    });
    if (notificationData.length) {
      notificationListContent.prepend(
        rss.notificationListItemCreate(
          rss.tool.getTime(),
          notificationData.map((e) => ({
            sourceHead: e.source,
            heading: e.data.title,
            buttonLink: e.data.link || e.data.guid,
            buttonText: "Haberi Görüntüle",
          }))
        ).element
      );

      if (
        notificationListContent.querySelectorAll("#notification-list-item")
          .length
      ) {
        notificationListContent
          .querySelectorAll("#notification-list-item")[0]
          .classList.add("active");
        setTimeout(() => {
          notificationListContent
            .querySelectorAll("#notification-list-item")[0]
            .classList.remove("active");
        }, 20000);
      }
      rss.notify();
      document.title = "*Bildirim Geldi";
      rss.config.previousData = rss.config.lastData;
    }
  }

  sourceListContent
    .querySelectorAll("#source-list-item")
    .forEach((event, length) => {
      if (event.source_url == rss.config.selectedSource) {
        event.classList.add("selected");
      }
    });

  scan(complier(rss.config.previousData), complier(rss.config.lastData));
};

// ANCHOR: Control
rss.control = async function () {
  // NOTE: DATA
  await rss.api();
  rss.selectedButtonUpdate();
  rss.sourceWrite(rss.config.lastData);
  rss.notification();
  setInterval(async function () {
    await rss.api();
    rss.selectedButtonUpdate();
    rss.sourceWrite(rss.config.lastData);
    rss.notification();
  }, rss.config.refreshTime);
};

// ANCHOR: ROOT APP
rss.app = function () {
  rss.control();
};

// ANCHOR: RUN APP
rss.app();

// ANCHOR: Notification Control Button
notificationControButton.onclick = function () {
  notificationList.classList.toggle("active");
};

//--
document.addEventListener(
  "visibilitychange",
  () =>
    (document.title = document.hidden ? "--Sayfa arka planda--" : "RSS Live")
);
window.onbeforeunload = function (event) {
  event.returnValue =
    "Sayfayı yenilerseniz, veriler kaybolabilir. Devam etmek istiyor musunuz?";
  return "Sayfayı yenilerseniz, veriler kaybolabilir. Devam etmek istiyor musunuz?";
};
