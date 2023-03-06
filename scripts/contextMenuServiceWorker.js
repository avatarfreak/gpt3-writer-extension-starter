const sendMessage = (content) => {

	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		const activeTab = tabs[0].id;

		chrome.tabs.sendMessage(activeTab, { message: 'inject', content }, (response) => {
			if (response.status === 'failed') {
				console.log('injection failed.');
			}
		});
	});
}

// Function to get + decode API key
const getKey = () => {
	return new Promise((resolve, _reject) => {
		chrome.storage.local.get(["openai-key"], (result) => {
			if (result["openai-key"]) {
				const decodedKey = atob(result["openai-key"]);
				resolve(decodedKey);
			}
		});
	});
};


// Setup our generate function
const generate = async (prompt) => {
	// Get your API key from storage
	const key = await getKey();
	const url = "https://api.openai.com/v1/completions";

	// Call completions endpoint
	const completionResponse = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${key}`,
		},
		body: JSON.stringify({
			model: "text-davinci-003",
			prompt: prompt,
			max_tokens: 1250,
			temperature: 0.7,
		}),
	});

	// Select the top choice and send back
	const completion = await completionResponse.json();
	return completion.choices.pop();
};

// New function here
const generateCompletionAction = async (info) => {
	try {

		const { selectionText } = info;
		const basePromptPrefix = `
      Write me a detailed table of contents for a blog post with the title below.
  
      Title:
      `;

		// Add this to call GPT-3
		const baseCompletion = await generate(
			`${basePromptPrefix}${selectionText}`
		);

		// Second prompt
		const secondPromptCompletion = `
      Take the table of contents and title of the blog post below and generate a blod post written in the style of Paul Graham. Make it feel like a story. Don't just list the points. Go deep into each one. Explain why.

      Title: ${selectionText}

      Table of Contents: ${baseCompletion.text}

      Blog Post:

    `;

		// Send the output when we're all done
		sendMessage(secondPromptCompletion);

	} catch (error) {
		console.log(error);
		// Send error if occurred
		sendMessage(error.toString());
	}
};

// Add this in scripts/contextMenuServiceWorker.js
chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: "context-run",
		title: "Generate blog post",
		contexts: ["selection"],
	});
});

// Add listener
chrome.contextMenus.onClicked.addListener(generateCompletionAction);
