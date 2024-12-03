async function queryGemini(prompt) {
    const capabilities = await ai.languageModel.capabilities();
    if (capabilities.available === "readily") {
      const response = await ai.languageModel.generate({
        prompt,
        temperature: 0.7,
      });
      return response;
    } else {
      return "Gemini Nano is not available. Please check your setup.";
    }
  }
  
  chrome.runtime.onInstalled.addListener(() => {
    console.log("Omini is ready!");
  });
  