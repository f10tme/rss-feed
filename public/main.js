const client = { rss: {} };
let selectedrssid = 0;
client.rss.full = async () => {
    const data = await (await fetch("/rss/full", { cache: "no-store" })).json();
    document.getElementById("left-list-content").innerHTML = "";
    data.forEach(e => {
        const imageUrl = (e.image && e.image.url && isValidUrl(e.image.url)) ? e.image.url : 'null-icon.png'
        const imageAlt = (e.image && e.image.title) || 'No Image';
        let item = `
        <div id="list-item">
            <div id="image-box" title="${imageAlt}"><img src="${imageUrl}" alt="${imageAlt}" onerror="this.onerror=null; this.src='null-icon.png';"/></div>
            <button id="button-title" title="${e.link}">${e.title}</button>
        </div>
        `;
        document.getElementById("left-list-content").innerHTML += item;
    });
    document.querySelectorAll("#list-item").forEach((e, len) => e.onclick = () => {
        selectedrssid = len;
        document.querySelectorAll("#list-item").forEach((e, len) => e.removeAttribute("style"));
        e.style.background = "#aaa";
        e.style.color = "#fff";
        document.querySelector("#center-list #head").innerHTML = data[len].title;
        document.getElementById("center-list-content").innerHTML = "";
        data[len].items.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
        data[len].items.forEach((e, len) => {
            let item = `
            <div id="news-list-item">
            <b id="heading">${e.title}</b>
            <span id="description">${e.content}</span>
            <span id="pub-date">${timeAgo(e.pubDate)}</span>
            <a id="home-open-link" href="${e.link || e.guid}" target="_blank">Haberi Aç</a>
            </div>`;
            document.getElementById("center-list-content").innerHTML += item;
        });
    });
    document.querySelectorAll("#list-item")[selectedrssid].onclick();
    return client.rss.data = data;
}


let previousIds = []; // Önceki tüm feed'lerin link/guid listeleri burada tutulacak

client.rss.control = async function () {
    // Güncel veriyi al
    const currentData = await client.rss.full();  // Beklemek için `await` kullanıyoruz

    // Feed bazında link veya guid dizileri oluştur
    const currentIds = currentData.map(feed =>
        (feed.items || []).map(item => ({
            id: item.link || item.guid || "",
            pubDate: new Date(item.pubDate)  // Zaman damgası
        }))
    );

    // İlk defa çalışıyorsa önceki datayı doldurup çık
    if (previousIds.length === 0) {
        previousIds = JSON.parse(JSON.stringify(currentIds)); // Derin kopya
        return { changed: false };
    }

    let newItems = []; // Yeni eklenen öğeleri tutacak array
    const currentTime = new Date(); // Şu anki zamanı alıyoruz

    // Her feed ve içindeki id'leri (link veya guid) kontrol et
    for (let feedIndex = 0; feedIndex < currentIds.length; feedIndex++) {
        const ids = currentIds[feedIndex];

        // Feed için id'leri kontrol et
        for (let itemIndex = 0; itemIndex < ids.length; itemIndex++) {
            const currentItem = ids[itemIndex];

            // Eğer bu öğe önceki verilerde yoksa ve en yeni öğe ise (başta eklenen)
            if (
                !previousIds[feedIndex] ||
                !previousIds[feedIndex].some(item => item.id === currentItem.id)  // Önceden var olmayan id
            ) {
                // Şu anki zamanla yayın tarihi arasındaki farkı hesapla (milisaniye cinsinden)
                const timeDifference = currentTime - currentItem.pubDate;

                // Eğer fark 5 dakikadan (300.000 ms) fazla ise, bu öğeyi dikkate alma
                if (timeDifference <= 600000) {
                    // Yeni öğe bulundu ve eski verilerden gelmiyor
                    newItems.unshift({
                        feed: feedIndex,
                        index: itemIndex,
                        id: currentItem.id,
                        pubDate: currentItem.pubDate
                    });
                }
            }
        }
    }

    // Yeni öğeler varsa, önbelleği güncelle
    if (newItems.length > 0) {
        // Yeni öğeleri sıralayarak başa ekleyelim
        newItems.sort((a, b) => b.pubDate - a.pubDate); // En yeni öğe en üstte olacak

        // Önceki veriyi güncelle
        previousIds = JSON.parse(JSON.stringify(currentIds)); // Derin kopya

        // Yeni öğeleri işleme al
        newItems.forEach(newItem => {
            const { feed, index, id } = newItem;
            console.log(newItem);
            // Feed'in DOM elemanını kırmızı yap
            const listItems = document.querySelectorAll("#list-item");
            if (listItems[feed]) {
                listItems[feed].style.background = "#f00";
                listItems[feed].style.color = "#fff";
            }

            // Bildirimler alanına yeni öğeyi ekle
            document.getElementById("notification-list-content").innerHTML += `<div id="notify-item"><span id="date">${getFormattedTime()}</span><a href="${id}" target="_blank">${id}</a></div>`;
        });

        // Bildirim sayısını güncelle
        document.getElementById("open-notification").innerText = `Bildirim Listesi (${document.querySelectorAll("#notification-list-content a").length})`;

        return {
            changed: true,
            newItems: newItems // Sadece yeni eklenen öğeleri döndür
        };
    }
    document.querySelector("#rss-container #left-list #head").innerHTML = `Son Tarama: ${getFormattedTime()}`;
    return { changed: false };
};

client.rss.control();




let notify = new Audio('notify.mp3');
setInterval(async () => {
    let control = await client.rss.control();
    if (control.changed) {
        notify.play();
    }
}, 60000);


function timeAgo(dateStr) {
    // Geçmiş tarih dizesini Date objesine çeviriyoruz
    const pastDate = new Date(dateStr);

    // Mevcut zamanı alıyoruz
    const now = new Date();

    // İki tarih arasındaki farkı milisaniye cinsinden hesaplıyoruz
    const diffInMilliseconds = now - pastDate;

    // Milisaniyeyi dakika, saat, gün cinsine çeviriyoruz
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60)); // Milisaniye -> Dakika
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60)); // Milisaniye -> Saat
    const diffInDays = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24)); // Milisaniye -> Gün
    const diffInWeeks = Math.floor(diffInDays / 7); // Gün -> Hafta

    // Zaman dilimini döndürüyoruz
    if (diffInMinutes < 1) {
        return "Az önce";
    } else if (diffInMinutes < 60) {
        return `${diffInMinutes} dakika önce`;
    } else if (diffInHours < 24) {
        return `${diffInHours} saat önce`;
    } else if (diffInDays < 7) {
        return `${diffInDays} gün önce`;
    } else if (diffInWeeks < 4) {
        return `${diffInWeeks} hafta önce`;
    } else {
        return pastDate.toLocaleString('tr-TR');
    }
}



function convertTurkey(dateStr) {

    const date = new Date(dateStr);

    const formatter = new Intl.DateTimeFormat('tr-TR', {
        timeZone: 'Europe/Istanbul',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
    });

    const turkishDate = formatter.format(date);
    return turkishDate;

}


document.getElementById("open-notification").onclick = function () {
    document.getElementById("notification-container").classList.toggle("active");
};



// Sayfa yenilenmesi engelleniyor
window.onbeforeunload = function (event) {
    event.returnValue = 'Sayfayı yenilerseniz, veriler kaybolabilir. Devam etmek istiyor musunuz?';
    return 'Sayfayı yenilerseniz, veriler kaybolabilir. Devam etmek istiyor musunuz?';
};

// Gönderildiği saati eklemek için formatlı bir tarih fonksiyonu kullanabiliriz
function getFormattedTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');  // Saat
    const minutes = String(now.getMinutes()).padStart(2, '0');  // Dakika
    const seconds = String(now.getSeconds()).padStart(2, '0');  // Saniye
    return `${hours}:${minutes}:${seconds}`;  // Saat:Dakika:Saniye formatında döner
}

function isValidUrl(url) {
    const pattern = new RegExp('^(https?:\\/\\/)?.+', 'i');
    return pattern.test(url);
}