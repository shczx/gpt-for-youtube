async function getActiveTabURL() {
    const tabs = await chrome.tabs.query({
        currentWindow: true,
        active: true
    });
  
    return tabs[0];
}

async function sendMessageToChatGPT(caption, message) {
    const openaiApiKey = '<Your openai api key>';
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo-0125',
        messages: [
          {role: "system", content: `You are an assistant who answers users' questions based on the context of a video. The following is the video's transcript: ${caption}`},
          {role: "user", content: message}
      ],
        max_tokens: 150
      })
    });
    const data = await response.json();
    return data.choices[0].message.content.trim();
}

document.addEventListener('DOMContentLoaded', async function() {
    const activeTab = await getActiveTabURL();
    const queryParameters = activeTab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    const currentVideo = urlParameters.get("v");

    const inputText = document.getElementById('inputText');
    const chatsDiv = document.getElementById('chats');

    if (!(activeTab.url.includes("youtube.com/watch") && currentVideo)) {
        const errorNote =  "It seems that you are not watching a YouTube video. You can start a chat when watching a Youtube video."
        displayNote(errorNote);
    }
    else {
        const {caption, title} = await chrome.runtime.sendMessage({type: "GET"});
        console.log(caption);
        console.log(title);

        if (!caption || !title) {
            const errorNote = "The extension has some trouble with getting the caption of the video. Please either reload the page or check whether the video has English captions."
            displayNote(errorNote);
            return;
        }

        displayMessage(`You are watching the following video: ${title}. You can ask me any question about the video.`, true);

        inputText.onkeyup = async (event) => {
            if (event.key === "Enter") {
                const userInput = inputText.value.trim();
                if (!userInput) return;
                
                displayMessage(userInput, false);
                inputText.value = "";
                const loadNote = displayNote("Waiting for GPT's reponses...");
                const response = await sendMessageToChatGPT(caption, userInput);
                loadNote.remove();
                displayMessage(response, true);
            }
        };
    }

    function displayNote(note) {
        let newNote = document.createElement("div");

        newNote.classList.add("message", "note");
        newNote.innerHTML = `${note}`;
        
        chatsDiv.appendChild(newNote);
        chatsDiv.scrollTop = chatsDiv.scrollHeight;

        return newNote;
    }

    function displayMessage(message, isGPT) {
        let newMessage = document.createElement("div");

        if (isGPT) {
            newMessage.classList.add("message", "response");
            newMessage.innerHTML = `<b>GPT: </b> ${message}`;
        }
        else {
            newMessage.classList.add("message");
            newMessage.innerHTML = `<b>Question: </b> ${message}`;
        }
        
        chatsDiv.appendChild(newMessage);
        chatsDiv.scrollTop = chatsDiv.scrollHeight;
    }
});
