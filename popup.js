document.getElementById("summarize").addEventListener("click", async () => {

    const output = document.getElementById("output");

    output.innerText = "Generating summary...";

    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    try {

        // Inject content script
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"]
        });

        // Get webpage text
        chrome.tabs.sendMessage(
            tab.id,
            { action: "getText" },

            async (response) => {

                if (chrome.runtime.lastError) {

                    output.innerText =
                        chrome.runtime.lastError.message;

                    return;
                }

                if (!response) {

                    output.innerText =
                        "No response from webpage.";

                    return;
                }

                const text = response.text.slice(0, 3000);

                // PASTE YOUR GROQ API KEY
                const apiKey = "your_groq_api_key_here";

                try {

                    const res = await fetch(
                        "https://api.groq.com/openai/v1/chat/completions",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${apiKey}`
                            },

                            body: JSON.stringify({

                                model:"llama-3.1-8b-instant",

                                messages: [
                                    {
                                        role: "user",
                                        content:
`Summarize this webpage in short bullet points:

${text}`
                                    }
                                ],

                                temperature: 0.5
                            })
                        }
                    );

                    const data = await res.json();

                    console.log(data);

                    if (data.error) {

                        output.innerText =
                            data.error.message;

                        return;
                    }

                    output.innerText =
                        data.choices[0].message.content;

                } catch (err) {

                    console.error(err);

                    output.innerText =
                        err.message;
                }
            }
        );

    } catch (err) {

        console.error(err);

        output.innerText =
            err.message;
    }
});