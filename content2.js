window.addEventListener("message", (event) => {
    if (event.data.type && (event.data.type === "NEW")) {
      console.log("Content script received: " + event.data.text);
      chrome.runtime.sendMessage(
          {
            type: 'NEW',
            caption: event.data.text,
            title: document.title.split(" - YouTube")[0]
          },
          (response) => {
            console.log(response.message);
          }
        );
    }
  }, false);