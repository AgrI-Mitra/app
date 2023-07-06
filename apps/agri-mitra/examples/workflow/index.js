document.addEventListener("DOMContentLoaded", () => {

    const dropdown = document.querySelector(".dropdown");
    const dropdownContent = document.querySelector(".dropdown-content");

    dropdown.addEventListener("click", (event) => {
        event.stopPropagation();
        dropdownContent.classList.toggle("show");
    });

    dropdownContent.addEventListener("click", (event) => {
        event.preventDefault();
        const target = event.target;
        if (target.tagName === "A") {
            const lang = target.getAttribute("data-lang");
            setLanguage(lang);
            dropdownContent.classList.remove("show");
        }
    });

    function setLanguage(lang) {
        localStorage.setItem("locale", lang);
    }

    const messageContainer = document.getElementById("message-container");
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-button");
    const recordButton = document.getElementById("record-button");
    
    let isRecording = false;
    let audioChunks = [];

    messageInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
          sendButton.click();
        }
      });

    sendButton.addEventListener("click", () => {
        const messageText = messageInput.value.trim();
        if (messageText !== "") {
            appendMessage(messageText);
            messageInput.value = "";
        }
    });
    
    recordButton.addEventListener("click", () => {
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
        }
    });
    
    function startRecording() {
        isRecording = true;
        audioChunks = [];
        recordButton.classList.add("recording");
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.addEventListener("dataavailable", event => {
                    audioChunks.push(event.data);
                });
                mediaRecorder.addEventListener("stop", () => {
                    const audioBlob = new Blob(audioChunks);
                    const reader = new FileReader();
                    reader.onloadend = function() {
                        const base64Audio = reader.result.split(",")[1];
                        convertAudioToText(base64Audio);
                    };
                    reader.readAsDataURL(audioBlob);
                });
                mediaRecorder.start();
            })
            .catch(error => {
                console.error("Error accessing microphone:", error);
            });
    }
    
    function stopRecording() {
        isRecording = false;
        recordButton.classList.remove("recording");
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.addEventListener("stop", () => {
                    mediaRecorder.stream.getTracks().forEach(track => track.stop());
                });
                mediaRecorder.stop();
            })
            .catch(error => {
                console.error("Error accessing microphone:", error);
            });
    }

    function convertAudioToText(base64Audio) {
        // const aiToolsSDK = new AiToolsSDK();
        AITools.stt(base64Audio)
            .then(response => {
                console.log(response)
                const transcribedText = response.text;
                if (transcribedText) {
                    appendMessage(transcribedText);
                }
            })
            .catch(error => {
                console.error("Error converting audio to text:", error);
            });
    }

    function appendMessage(message) {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message");
        messageElement.textContent = message;
        messageContainer.appendChild(messageElement);
    }
    document.querySelector("body").onload =
    async function fetchAiToolsSdk() {
      try {
        const response = await fetch('https://cdn.jsdelivr.net/npm/ai-tools-sdk@0.1.2/src/index.ts');
      } catch (error) {
        console.error(error);
      }
    }
    
});
