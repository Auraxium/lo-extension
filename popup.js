let styles = {
  display: "absolute",
  width: "12px",
  height: "12px",
  backgroundColor: "rgb(233, 78, 109)",
  transform: `translate(90%)`,
};
let id;

if (window.localStorage.getItem("accounts")) {
  let json = JSON.parse(window.localStorage.getItem("accounts"));
  if (json?.google?.googleId) {
    id = json?.google?.googleId;
    // console.log("got id from lo-player site:", id);
    chrome.storage.local.set({ id: id });
  }
}

async function main() {
  if (!id) {
    let temp = await chrome.storage.local.get(["id"]);
    if (temp) {
      id = temp.id;
    } else {
      return console.log("no id ABORT");
    }
  }
  // await new Promise((res) => setTimeout(() => res(""), 3000));
  // console.log(`the number of divs on this page is: ${document.querySelectorAll("div").length}`);
  let observer = new MutationObserver(callback);
  observer.observe(document.body, { childList: true, subtree: true });
}

let list = ["ytd-rich-grid-media", "ytd-compact-video-renderer", "ytd-rich-item-rende,rer", "ytd-playlist-panel-video-renderer"];

var callback = function (mutationsList, observer) {
  for (var mutation of mutationsList) {
    if (mutation.type !== "childList") return;
    mutation.addedNodes.forEach(function (node) {
      if (node.tagName && list.includes(node.tagName.toLowerCase())) {
        if (node.querySelector("lo")) return;
        let icon = document.createElement("lo");
        for (let prop in styles) icon.style[prop] = styles[prop];
        icon.innerHTML = "heo";
        icon.onclick = (e) => {
          let yid =
            e.target.parentNode
              .querySelector("a")
              ?.getAttribute("href")
              ?.match(/=(.*?)(?=&|$)/)?.[1] || null;

          if (!yid) console.log("no yid");

          chrome.runtime.sendMessage({ id: yid }, function (response) {
            console.log(response);

            if (!response) {
              fetch("https://lo-player.auraxium.online/save", {
                method: "POST",
                body: JSON.stringify({
                  _id: id,
                  version: 0.7,
                  username: "extension",
                  parts: {
                    [`data.extension.${yid}`]: "yt",
                    "data.device": navigator.userAgent,
                    // "data.date": Date.now(),
                  },
                }),
                headers: { "Content-Type": "application/json" },
              })
                .then((res) => res.json())
                .then(console.log)
                .catch((err) => console.log(err));
            }
          });
        };
        node.appendChild(icon);
      }
    });
  }
};

// Later, you can disconnect the observer when it's no longer needed
// observer.disconnect();

main();
