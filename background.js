let sent = false;
let page = "https://lo-player.netlify.app" //"http://localhost:5174"

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
	if(!request.id) return;
	sent = false
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach((tab) => {
      if (!tab.url || !tab.url.startsWith(page)) return;
			sent = true;
			let id = request.id;
      chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: (id) => {
            let div = document.getElementById("extension-message");
            div.dataset.id = id;
            div.click();
          },
          args: [id],
        })
        .then(() => {
          console.log("info() function executed on tab:", tab.id);
        })
        .catch((error) => {
          console.error("Error executing script:", error);
        });
    });
		sendResponse(sent ? { res: 'done' } : undefined);
  });

  return true;
}); 