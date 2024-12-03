// Retrieve data from chrome.storage.sync or localStorage if not found
chrome.storage.sync.get("ominiData", ({ ominiData }) => {
  if (ominiData) {
    const { userName, pet, petName } = ominiData;
    setPetImage(pet, petName);
  } else {
    console.log("No data found in chrome.storage.sync. Trying localStorage...");
    const localStorageData = localStorage.getItem("ominiData");
    if (localStorageData) {
      const { userName, pet, petName } = JSON.parse(localStorageData);
      setPetImage(pet, petName);
    } else {
      console.log("No data found in localStorage.");
    }
  }
});

// Main popup HTML template
const mainPage = `
<div id="omini-options" class="options">
    <button id="aiFeatureBtn">Analyze Webpage</button>
    <button id="translateBtn">Translate Webpage</button>
</div>
`;

// Function to set the pet image and popup
async function setPetImage(pet, petName) {
  const petImage = document.createElement("img");
  petImage.src = pet
    ? chrome.runtime.getURL(`assets/pet_${pet}.png`)
    : chrome.runtime.getURL(`assets/astronaut.png`);

  petImage.id = "omini-pet";
  petImage.style.position = "fixed";
  petImage.style.bottom = "20px";
  petImage.style.right = "20px";
  petImage.style.width = "50px";
  petImage.style.cursor = "pointer";
  petImage.style.borderRadius = "50px";
  document.body.appendChild(petImage);

  const popupContainer = document.createElement("div");
  popupContainer.id = "omini-popup";
  popupContainer.style.position = "fixed";
  popupContainer.style.bottom = "80px";
  popupContainer.style.right = "20px";
  popupContainer.style.width = "auto";
  popupContainer.style.background = "#fff";
  popupContainer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
  popupContainer.style.borderRadius = "10px";
  popupContainer.style.padding = "20px";
  popupContainer.style.display = "none";
  popupContainer.style.zIndex = "1000";
  popupContainer.style.fontFamily = "Arial, sans-serif";
  popupContainer.innerHTML = mainPage;

  document.body.appendChild(popupContainer);

  petImage.addEventListener("click", () => {
    popupContainer.style.display =
      popupContainer.style.display === "none" ? "flex" : "none";
  });

  // AI Feature button click
  document.getElementById("aiFeatureBtn").addEventListener("click", async () => {
    const currentPageUrl = window.location.href;
    const chatMessage = `
      Please analyze the webpage at ${currentPageUrl}.
      Provide a detailed analysis (within 100 words) of the website, including its design, functionality, content, and security.
    `;
  
    try {
      const session = await ai.languageModel.create();
      const result = await session.prompt(chatMessage);
  
      // Format AI response
      const formattedResponse = result
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
        .replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  
      // Create popup container
      const aiPopupContainer = document.createElement("div");
      aiPopupContainer.style.position = "fixed";
      aiPopupContainer.style.top = "50%";
      aiPopupContainer.style.left = "50%";
      aiPopupContainer.style.transform = "translate(-50%, -50%)";
      aiPopupContainer.style.width = "400px";
      aiPopupContainer.style.background = "#fff";
      aiPopupContainer.style.border = "1px solid #ccc";
      aiPopupContainer.style.borderRadius = "10px";
      aiPopupContainer.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
      aiPopupContainer.style.padding = "20px";
      aiPopupContainer.style.zIndex = "1000";
  
      // Add close button
      const closeButton = document.createElement("button");
      closeButton.textContent = "Close";
      closeButton.style.position = "absolute";
      closeButton.style.top = "10px";
      closeButton.style.right = "10px";
      closeButton.style.background = "#ff4d4d";
      closeButton.style.color = "#fff";
      closeButton.style.border = "none";
      closeButton.style.borderRadius = "5px";
      closeButton.style.padding = "5px 10px";
      closeButton.style.cursor = "pointer";
      closeButton.style.fontSize = "12px";
  
      // Close button functionality
      closeButton.addEventListener("click", () => {
        document.body.removeChild(aiPopupContainer);
      });

      // Add the pet image and formatted AI response inside the AI popup
      const aiResponseContainer = document.createElement("div");
      aiResponseContainer.style.marginTop = "10px";
      aiResponseContainer.style.fontSize = "14px";
      const petImageStudy = pet
    ? chrome.runtime.getURL(`assets/pet_${pet}_study.png`)
    : chrome.runtime.getURL(`assets/astronaut.png`);

      aiResponseContainer.innerHTML = `
        <strong class="ai-analyze-heading"><img src="${petImageStudy}" alt="Pet Image" style="width: 50px; height: 50px; border-radius: 50%; margin-left: 10px;"> ${petName} Analyzed : </strong>
        <p class="ai-analyze-response">${formattedResponse}</p>
      `;

      // Risk Section
      let riskEmoji = "✅";
      let riskText = "Minimal risk.";
      if (formattedResponse.toLowerCase().includes("high risk")) {
        riskEmoji = "💀";
        riskText = "High risk! Take precautions.";
      } else if (formattedResponse.toLowerCase().includes("moderate")) {
        riskEmoji = "⚠️";
        riskText = "Moderate risk. Proceed with caution.";
      }
  
      const riskSection = document.createElement("div");
      riskSection.style.marginTop = "10px";
      riskSection.style.backgroundColor = "cornsilk"
      riskSection.style.padding = "10px"
      riskSection.style.borderRadius = "10px"
      riskSection.innerHTML = `<strong>${riskEmoji}</strong> ${riskText}`;
  
      // Append all elements to the popup container
      aiPopupContainer.appendChild(closeButton);
      aiPopupContainer.appendChild(aiResponseContainer);
      aiPopupContainer.appendChild(riskSection);
  
      // Append popup container to the body
      document.body.appendChild(aiPopupContainer);
    } catch (error) {
      console.error("Error analyzing the webpage:", error);
    }
  });
  

  // Translate button click
  document.getElementById("translateBtn").addEventListener("click", () => {
    showLanguageSelector(popupContainer);
  });
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
    <button id="confirmTranslate">Translate</button>
    <button id="backBtn">Back</button>
  `;

  document.getElementById("confirmTranslate").addEventListener("click", () => {
    const selected = document.getElementById("languageSelector").value;
    const [source, target] = selected.split("-");
    translatePage(source, target);
  });

  document.getElementById("backBtn").addEventListener("click", () => {
    popupContainer.innerHTML = mainPage; // Replace with your main page content
  });
}

async function translatePage(sourceLang, targetLang) {
  console.log(`Translating from ${sourceLang} to ${targetLang}`);
  
  // Create a translator instance
  const translator = await self.translation.createTranslator({
    sourceLanguage: sourceLang,
    targetLanguage: targetLang,
  });

  // Recursive function to handle text nodes
  async function translateElementText(element) {
    if (element.nodeType === Node.TEXT_NODE && element.textContent.trim()) {
      try {
        element.textContent = await translator.translate(element.textContent);
      } catch (e) {
        console.error("Translation failed:", e);
      }
    } else if (element.nodeType === Node.ELEMENT_NODE) {
      Array.from(element.childNodes).forEach(translateElementText);
    }
  }

  // Select only elements likely to contain visible text
  const elements = document.querySelectorAll(`
    h1, h2, h3, h4, h5, h6, 
    p, span, a, li, dt, dd, 
    th, td, caption, figcaption, 
    button, label, div
  `);

  elements.forEach((el) => translateElementText(el));
}
