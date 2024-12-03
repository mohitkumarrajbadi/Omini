document.addEventListener("DOMContentLoaded", () => {
    const setupDiv = document.getElementById("setup");
    const mainDiv = document.getElementById("main");
    const chatContainer = document.getElementById("chatContainer");
    const rewriteContainer = document.getElementById("rewriteContainer");
    const saveBtn = document.getElementById("saveBtn");
    const pets = document.querySelectorAll(".pet");
    const talkBtn = document.getElementById("talkBtn");
    const rewriteBtn = document.getElementById("rewriteBtn");
    const translateBtn = document.getElementById("translateBtn");
    const chatHistory = document.getElementById("chatHistory");
    const chatMessageInput = document.getElementById("chatMessage");
    const translateContainer = document.getElementById("translateContainer");
    const popupContainer = document.getElementById("languageSelectorContainer");
    showLanguageSelector(popupContainer);


    (async function initializeApp() {
        const translateSendBtn = document.getElementById("translateSendBtn");
        const translateMessage = document.getElementById("translateMessage");
        const inputLanguageSelect = document.getElementById("inputLanguage");
        const outputLanguageSelect = document.getElementById("outputLanguage");

        let languageDetector;

        // Initialize Language Detector
        async function initializeLanguageDetector() {
            if ('translation' in self && 'canDetect' in self.translation) {
                const canDetect = await translation.canDetect();
                if (canDetect === 'no') {
                    alert("Language Detector API is not usable at the moment.");
                    return;
                }

                if (canDetect === 'readily') {
                    languageDetector = await translation.createDetector();
                } else if (canDetect === 'after-download') {
                    languageDetector = await translation.createDetector();
                    languageDetector.addEventListener('downloadprogress', (e) => {
                        console.log(`Download progress: ${e.loaded} / ${e.total}`);
                    });
                    await languageDetector.ready;
                }
            } else {
                alert("Language Detector API is not supported in this browser.");
            }
        }

        // Append messages to chat UI
        function appendToChat(sender, message) {
            const chatHistory = document.querySelector(".translator-history");

            // Create a new chat message element
            const messageElement = document.createElement("div");
            messageElement.classList.add("chat-message");

            // Style based on sender
            if (sender === "User") {
                messageElement.classList.add("user-message");
                messageElement.style.textAlign = "right";
                messageElement.style.color = "#0078d7"; // Example color for user
            } else if (sender === "Translation") {
                messageElement.classList.add("translation-message");
                messageElement.style.textAlign = "left";
                messageElement.style.color = "#28a745"; // Example color for translation
            } else {
                messageElement.classList.add("system-message");
                messageElement.style.textAlign = "center";
                messageElement.style.fontStyle = "italic";
                messageElement.style.color = "#555"; // Example color for system
            }

            // Set the content
            messageElement.textContent = `${sender}: ${message}`;

            // Append to the chat history
            chatHistory.appendChild(messageElement);

            // Scroll to the bottom of the chat history
            chatHistory.scrollTop = chatHistory.scrollHeight;
        }

        // Simulate translation
        function simulateTranslation(text, fromLanguage, toLanguage) {
            return `Translated "${text}" from ${fromLanguage} to ${toLanguage}.`;
        }

        // Handle translation request
        translateSendBtn.addEventListener("click", async () => {
            const userText = translateMessage.value.trim();
            const inputLanguage = inputLanguageSelect.value;
            const outputLanguage = outputLanguageSelect.value;

            if (!userText) {
                alert("Please enter a message to translate.");
                return;
            }

            if (!languageDetector && inputLanguage === 'auto') {
                alert("Language Detector is not initialized.");
                return;
            }

            let detectedLanguage = inputLanguage;
            if (inputLanguage === 'auto') {
                // Detect the language of the input text
                const results = await languageDetector.detect(userText);
                detectedLanguage = results[0].detectedLanguage; // Get the most likely language
                appendToChat("System", `Auto-detected language: ${detectedLanguage}`);
            }

            // Simulate translation
            const translatedMessage = simulateTranslation(userText, detectedLanguage, outputLanguage);
            appendToChat("User", userText);
            appendToChat("Translation", translatedMessage);
        });

        // Initialize the app
        await initializeLanguageDetector();
    })();



    let selectedPet = null;

    // Check if there is saved data in localStorage
    const savedData = JSON.parse(localStorage.getItem("ominiData"));
    console.log("Saved Data - " + savedData)

    if (savedData) {
        setupDiv.style.display = "none";
        mainDiv.style.display = "block";
        document.getElementById("greeting").innerText = `Hello, ${savedData.userName}! Meet ${savedData.petName}`;
        document.getElementById("chosenPet").src = `assets/pet_${savedData.pet}.png`;
        document.getElementById("mainChosenPet").src = `assets/pet_${savedData.pet}.png`;
        document.getElementById("translateChosenPet").src = `assets/pet_${savedData.pet}_study.png`;
        document.getElementById("rewriteChosenPet").src = `assets/pet_${savedData.pet}.png`;
    }

    // Event listener for pet selection
    pets.forEach((pet) => {
        pet.addEventListener("click", () => {
            debugger;
            pets.forEach((p) => p.classList.remove("selected"));
            pet.classList.add("selected");
            selectedPet = pet.id;
            console.log("selected pet - " + selectedPet)
        });
    });

    // Save button event listener
    document.getElementById("saveBtn").addEventListener("click", () => {
        const userName = document.getElementById("userName").value.trim();
        debugger
        if (!userName || !selectedPet) {
            alert("Please enter your name and select a pet!");
            return;
        }

        // Pet names object
        const petNames = {
            monkey: 'Sir Bananacutie',
            dog: 'Ruff Ruff McSniff',
            cat: 'Meowsterious',
            gorilla: 'Gorillaz',
            cow: 'Moo-tini',
            fox: 'Foxy McFurball',
            tiger: 'Tony the Tiger'
        };

        // Get the pet name based on the selected pet
        const petName = petNames[selectedPet];

        // Create the data object to store
        const data = {
            userName,
            pet: selectedPet,
            petName,
        };

        // Save the data in localStorage
        localStorage.setItem("ominiData", JSON.stringify(data));

        // Save data to the Chrome storage
        chrome.storage.sync.set({ "ominiData": data }, () => {
            console.log("Data saved to chrome.storage.sync.");
        });


        // Reload the page or navigate as needed
        location.reload();
    });

    // Talk button event listener to show the chat container
    talkBtn.addEventListener("click", () => {
        chatContainer.style.display = "block";
        mainDiv.style.display = "none";
        rewriteContainer.style.display = "none";
    });

    // Translate button event listener
    translateBtn.addEventListener("click", async () => {
        translateContainer.style.display = "block";
        mainDiv.style.display = "none";
    });

    // Back button event listener to return to main screen
    document.getElementById("backBtn").addEventListener("click", () => {
        chatContainer.style.display = "none";
        rewriteContainer.style.display = "none";
        mainDiv.style.display = "block";
    });

    // Back button event listener to return to main screen
    document.getElementById("backTranslateBtn").addEventListener("click", () => {
        translateContainer.style.display = "none";
        mainDiv.style.display = "block";
    });

    // Send button event listener to handle user input and AI response
    document.getElementById("sendBtn").addEventListener("click", async () => {
        const chatMessage = chatMessageInput.value.trim();

        // Proceed only if there's a message typed
        if (chatMessage) {
            // Display the user's message on the right
            const userMessage = document.createElement("div");
            userMessage.className = "chat-message user";
            userMessage.innerHTML = `${chatMessage}`;
            chatHistory.appendChild(userMessage);

            // Clear the input field
            chatMessageInput.value = "";

            // Check model availability
            const { available } = await ai.languageModel.capabilities();

            if (available !== "no") {
                const session = await ai.languageModel.create();

                // Get the AI response synchronously (use the input as the prompt)
                const result = await session.prompt(chatMessage);

                // Format the result using regular expressions
                const formattedResult = result
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold: **text**
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')            // Italic: *text*
                    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')            // Header: # text (at the start of a line)
                    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')           // Header: ## text (for a secondary header)
                    .replace(/^### (.*?)$/gm, '<h3>$1</h3>');         // Header: ### text (for a tertiary header)

                // Create the AI message element
                const aiMessage = document.createElement("div");
                aiMessage.className = "chat-message ai";
                aiMessage.innerHTML = formattedResult;

                // Append the AI message to chat history
                chatHistory.appendChild(aiMessage);

            } else {
                const aiMessage = document.createElement("div");
                aiMessage.className = "chat-message ai";
                aiMessage.innerHTML = "Sorry, I am not available right now.";
                chatHistory.appendChild(aiMessage);
            }

            chatHistory.scrollTop = chatHistory.scrollHeight;
        }
    });

    // Clear chat history when the clear button is clicked
    document.getElementById("clearChatBtn").addEventListener("click", () => {
        chatHistory.innerHTML = "";
    });

    // Rewrite button event listener
    document.getElementById('rewriteBtn').addEventListener('click', () => {
        document.getElementById('main').style.display = 'none';
        document.getElementById('rewriteContainer').style.display = 'flex';
    });

    document.getElementById("rewriteButton").addEventListener("click", async () => {
        const prompt = document.getElementById("rewritePrompt").value.trim();
        const context = document.getElementById("rewriteContext").value.trim();

        if (!prompt) {
            alert("Please enter a prompt to rewrite.");
            return;
        }

        try {
            // Call the createWriter function
            const response = await createWriter(prompt, context);

            console.log(response)
            // Show the response in the UI
            document.getElementById("rewriteResponse").textContent = response;
            document.getElementById("rewriteResponseContainer").style.display = "block";
        } catch (error) {
            console.error("Error in Rewrite:", error);
            alert("Failed to rewrite. Please try again.");
        }
    });

    document.getElementById("rewriteAgainButton").addEventListener("click", async () => {
        const response = document.getElementById("rewriteResponse").textContent.trim();
        const tone = document.getElementById("rewriteTone").value.trim();
        const length = document.getElementById("rewriteLength").value.trim();

        if (!response) {
            alert("No response available to rewrite again.");
            return;
        }

        try {
            // Call the createRewriter function
            const rewrittenResponse = await createRewriter(response, tone, length);

            // Update the response in the UI
            document.getElementById("rewriteResponse").textContent = rewrittenResponse;
        } catch (error) {
            console.error("Error in Rewrite Again:", error);
            alert("Failed to rewrite again. Please try again.");
        }
    });

    document.getElementById("copyResponse").addEventListener("click", () => {
        const responseText = document.getElementById("rewriteResponse").textContent;
        navigator.clipboard.writeText(responseText).then(
            () => alert("Response copied to clipboard!"),
            (error) => alert("Failed to copy response.")
        );
    });

    document.getElementById('backToMainRewrite').addEventListener('click', function () {
        // Hide the rewrite section
        document.getElementById('rewriteContainer').style.display = 'none';

        // Show the main section
        document.getElementById('main').style.display = 'block';
    });

    function showLanguageSelector(popupContainer) {
        const installedLanguages = [
            { code: "en-es", label: "English to Spanish" },
            { code: "en-ja", label: "English to Japanese" },
            { code: "en-hi", label: "English to Hindi" },
            { code: "en-pt", label: "English to Portuguese" },
            { code: "en-ru", label: "English to Russian" },
            { code: "en-tr", label: "English to Turkish" },
            { code: "en-vi", label: "English to Vietnamese" },
            { code: "en-zh", label: "English to Chinese" },
        ];

        const languageOptions = installedLanguages
            .map(({ code, label }) => `<option value="${code}">${label}</option>`)
            .join("");

        popupContainer.innerHTML = `
          <h3>Select Language to Translate</h3>
          <select id="languageSelector">
            ${languageOptions}
          </select>
        `;
    }


    document.getElementById("translateSendBtn").addEventListener("click", async () => {
        const message = document.getElementById("translateMessage").value;
        const selectedLang = document.getElementById("languageSelector").value;
      
        if (!message || !selectedLang) {
          alert("Please enter a message and select a language.");
          return;
        }
      
        const [sourceLang, targetLang] = selectedLang.split("-");
        
        try {
          const translatedMessage = await translateText(message, sourceLang, targetLang);
          displayTranslationHistory(message, translatedMessage);
        } catch (error) {
          console.error("Translation failed", error);
        }
      });
      
      async function translateText(message, sourceLang, targetLang) {
        // Call your translation API or function here
        // Example using a translation library
        const translator = await self.translation.createTranslator({ sourceLanguage: sourceLang, targetLanguage: targetLang });
        return await translator.translate(message);
      }
      
      function displayTranslationHistory(original, translated) {
        const historyContainer = document.getElementById("translateHistory");
        const historyItem = document.createElement("div");
        historyItem.innerHTML = `
          <p><strong>Original:</strong> ${original}</p>
          <p><strong>Translated:</strong> ${translated}</p>
        `;
        historyContainer.appendChild(historyItem);
      }
      


    function showLanguageSelector(popupContainer) {
        const installedLanguages = [
            { code: "en-es", label: "English to Spanish" },
            { code: "en-ja", label: "English to Japanese" },
            { code: "en-hi", label: "English to Hindi" },
            { code: "en-pt", label: "English to Portuguese" },
            { code: "en-ru", label: "English to Russian" },
            { code: "en-tr", label: "English to Turkish" },
            { code: "en-vi", label: "English to Vietnamese" },
            { code: "en-zh", label: "English to Chinese" },
        ];

        const languageOptions = installedLanguages
            .map(({ code, label }) => `<option value="${code}">${label}</option>`)
            .join("");

        popupContainer.innerHTML = `
          <h3>Select Language to Translate</h3>
          <select id="languageSelector">
            ${languageOptions}
          </select>
        `;
    }

      
    async function createWriter(prompt, context) {
        try {
            const writer = await ai.writer.create({
                sharedContext: context.trim(), // Optional shared context
            });

            // Writing task with prompt
            const result = await writer.write(prompt.trim());

            // Destroy writer to free resources
            writer.destroy();

            return result; // Return the generated result
        } catch (error) {
            console.error("Error in createWriter:", error);
            alert("Failed to generate the writing response. Please try again.");
            throw error;
        }
    }

    async function createRewriter(response, tone, length) {
        try {
            const rewriter = await ai.rewriter.create({
                // Add any required shared context if necessary
            });

            // Rewrite the response with tone and length settings
            const result = await rewriter.rewrite(response.trim(), {
                context: `Tone: ${tone}, Length: ${length}`,
            });

            // Destroy rewriter to free resources
            rewriter.destroy();

            return result; // Return the rewritten response
        } catch (error) {
            console.error("Error in createRewriter:", error);
            alert("Failed to rewrite the response. Please try again.");
            throw error;
        }
    }




});


function game() {
    // const feedPetBtn = document.getElementById("feedPetBtn");
    // const throwBallBtn = document.getElementById("throwBallBtn");
    // const makeCatRunBtn = document.getElementById("makeCatRunBtn");
    // const resetButton = document.getElementById("resetButton");
    // const petCanvas = document.getElementById("petCanvas");
    // const petEmotionText = document.getElementById("petEmotion");

    // const ctx = petCanvas.getContext("2d");

    // // Initialize the cat object
    // const cat = {
    //     x: 200,
    //     y: 250,
    //     width: 100,
    //     height: 100,
    //     emotion: "neutral",
    //     isRunning: false,
    //     isPlaying: false,
    //     happiness: 50,
    //     runSpeed: 5,
    // };

    // // Function to draw the cat (using basic shapes)
    // function drawCat() {
    //     ctx.clearRect(0, 0, petCanvas.width, petCanvas.height); // Clear the canvas

    //     // Draw the cat's body (circle)
    //     ctx.beginPath();
    //     ctx.arc(cat.x + cat.width / 2, cat.y + cat.height / 2, 40, 0, Math.PI * 2); // Cat's head
    //     ctx.fillStyle = "#FFD700"; // Cat's color (yellow)
    //     ctx.fill();
    //     ctx.closePath();

    //     // Draw cat's eyes (two small circles)
    //     ctx.beginPath();
    //     ctx.arc(cat.x + 30, cat.y + 230, 10, 0, Math.PI * 2); // Left eye
    //     ctx.arc(cat.x + 70, cat.y + 230, 10, 0, Math.PI * 2); // Right eye
    //     ctx.fillStyle = "#000000"; // Black color for eyes
    //     ctx.fill();
    //     ctx.closePath();

    //     // Draw cat's smile (arc)
    //     ctx.beginPath();
    //     ctx.arc(cat.x + 50, cat.y + 250, 30, 0, Math.PI); // Smile
    //     ctx.strokeStyle = "#000000";
    //     ctx.stroke();
    //     ctx.closePath();

    //     // Display the current emotion of the cat
    //     petEmotionText.textContent = `Cat is ${cat.emotion}`;
    // }

    // // AI interaction function
    // async function getAIResponse(action) {
    //     try {
    //         const session = await ai.languageModel.create();

    //         // Send the action as input to the AI to get the response
    //         const chatMessage = `The cat has been ${action}. How should the cat react?`;
    //         const result = await session.prompt(chatMessage);

    //         // Process the AI response to determine cat's emotion
    //         if (result) {
    //             return result.response || "neutral"; // Default to neutral if no response
    //         }
    //     } catch (error) {
    //         console.error("Error fetching AI response:", error);
    //         return "neutral"; // Default to neutral in case of error
    //     }
    // }

    // // Feed the cat (increase happiness)
    // feedPetBtn.addEventListener("click", async () => {
    //     cat.happiness += 10;
    //     if (cat.happiness > 100) cat.happiness = 100;

    //     // Call AI for reaction to feeding action
    //     cat.emotion = await getAIResponse('fed');

    //     drawCat();
    // });

    // // Throw a ball for the cat (makes it play)
    // throwBallBtn.addEventListener("click", async () => {
    //     cat.isPlaying = true;

    //     // Call AI for reaction to throwing a ball
    //     cat.emotion = await getAIResponse('ball thrown');

    //     drawCat();
    // });

    // // Make the cat run
    // makeCatRunBtn.addEventListener("click", async () => {
    //     cat.isRunning = true;

    //     // Call AI for reaction to making the cat run
    //     cat.emotion = await getAIResponse('running');

    //     makeCatRun();
    //     drawCat();
    // });

    // // Reset the cat to its initial state
    // resetButton.addEventListener("click", async () => {
    //     cat.happiness = 50;
    //     cat.emotion = "neutral";
    //     cat.isRunning = false;
    //     cat.isPlaying = false;
    //     cat.x = 200;
    //     cat.y = 250;

    //     // Call AI for reset
    //     cat.emotion = await getAIResponse('reset');

    //     drawCat();
    // });

    // // Function to simulate the cat running
    // function makeCatRun() {
    //     if (!cat.isRunning) return;
    //     let runInterval = setInterval(() => {
    //         cat.x += cat.runSpeed; // Move the cat to the right
    //         if (cat.x > petCanvas.width) { // Stop running once it reaches the edge
    //             cat.isRunning = false;
    //             clearInterval(runInterval);
    //         }
    //         drawCat();
    //     }, 30);
    // }

    // // Initial drawing of the cat
    // drawCat();
}






