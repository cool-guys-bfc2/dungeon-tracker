const params = new URLSearchParams(window.location.search);
const x = params.get('lang') || 'English';

console.log(x);


(async function translatePage(targetLanguage = "Spanish") {
  // 1. Load Puter.js dynamically if not already present
  if (!window.puter) {
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://js.puter.com/v2/";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // 2. Collect all visible text nodes on the page
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const text = node.nodeValue.trim();
        const parentTag = node.parentElement?.tagName.toLowerCase();
        // Skip scripts, styles, and empty spaces
        if (!text || ["script", "style", "noscript"].includes(parentTag)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const textNodes = [];
  let currentNode;
  while ((currentNode = walker.nextNode())) {
    textNodes.push(currentNode);
  }

  // 3. Batch and translate text using Puter.ai (GPT-5.4 nano model)
  for (const node of textNodes) {
    const originalText = node.nodeValue;
    const prompt = `Translate the following text to ${targetLanguage}. Output only the translated text, nothing else:\n\n${originalText}`;
    try {
      const translated = await puter.ai.chat(prompt, { model: "gpt-5.4-nano" });
      if (translated) {
        node.nodeValue = translated;
      }
    } catch (err) {
      console.warn("Translation skipped for node:", err);
    }
  }
  console.log("Page translation complete!");
})(x);
