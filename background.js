let captions = "";
let title = "";

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if (request.type === 'NEW') {
        captions = request.caption;
        title = request.title;
        const message = 'Captions Received';
        console.log(message);
        console.log(title);
        sendResponse({message: message,});
    }
    else if (request.type === 'GET') {
        sendResponse({caption: captions, title: title});
    }
});