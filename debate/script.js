// Simple XOR Obfuscation
function xorObfuscate(data, key) {
    return data.split('').map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join('');
}

// Base64 Decode Function
function base64Decode(data) {
    return atob(data);
}

// Simple Decoding Function
function simpleDecode(encodedKey) {
    const decodedKey = base64Decode(encodedKey);  // Base64 decode
    const xorKey = 'simplekey';                   // Simple XOR key for obfuscation
    return xorObfuscate(decodedKey, xorKey);      // Reverse the XOR obfuscation
}

// Example encoded key from Python for decoding
const encodedKey = "AAJAAB4KAUg6KyxdFV4uPx89HThZAzMWXBABCRgDQFkmCS5KIAI7OAQHOSAJQlsUQCI/Gg4YHS89AQY6OScSGlgePhwuLCcPGi4yKQYAH1EuIj1eMgAHACMzMhkuAQ43BR9KGDhVERwpJQo3LAw5FDgyLxQDKiEsQzsSKlcvCjMPGAULL1c+O18HJTkyGDc7SxEYQQspCQY7LDk7FwE9X1c4ECg=" ;
const apiKey = simpleDecode(encodedKey);
let aiPosition = "";
let userPosition = ""; 

async function generateDebateTopic(category) {
    const topicElement = document.getElementById("topic");
    const chatBox = document.getElementById("chatBox");
    const userInput = document.getElementById("userInput");
    const submitButton = document.getElementById("submitBtn");

    // Reset UI
    topicElement.innerText = "Generating debate topic...";
    chatBox.innerHTML = "";
    userInput.value = "";
    userInput.disabled = true;
    submitButton.disabled = true;

    // Define AI prompt based on category
    let categoryPrompt = "";
    switch (category) {
        case "fun":
            categoryPrompt = "Generate a **funny and lighthearted** MUN debate topic that people will enjoy debating.";
            break;
        case "competitive":
            categoryPrompt = "Generate a **serious, logical, and competitive** MUN debate topic that requires strong arguments.";
            break;
        case "political":
            categoryPrompt = "Generate a **real-world political debate** topic that is commonly discussed in Model United Nations.";
            break;
    }

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { 
                        role: "system", 
                        content: `You are an expert MUN debate topic generator. Your job is to create UNIQUE, engaging, and fair debate topics. The topics should be thought-provoking and match the given category.

                        **Category:** ${category.toUpperCase()}  
                        - Topics should be **one line** and **not a question**.
                        - Avoid repeating previous topics.
                        - Format topics in a **neutral statement**, e.g., "Cats are superior to dogs." instead of "Are cats better than dogs?".`
                    },
                    { role: "user", content: `Give me one ${categoryPrompt} as a single sentence.` }
                ]
            })
        });

        const data = await response.json();

        if (response.ok && data.choices) {
            let topic = data.choices[0].message.content.trim();

            // Ensure the AI didn't accidentally generate a question
            if (topic.endsWith("?")) {
                topic = topic.replace(/\?$/, ""); // Remove the question mark
            }

            topicElement.innerText = `Debate Topic: ${topic}`;
            chatBox.innerHTML += `<div class="chat ai"><strong>Delegate:</strong> Let's start the debate. Please state your position on this topic (either "for" or "against").</div>`;

            userInput.disabled = false;
            submitButton.disabled = false;
        } else {
            throw new Error("Failed to generate topic.");
        }
    } catch (error) {
        topicElement.innerText = "Error generating topic. Try again.";
        chatBox.innerHTML += `<div class="chat ai error">Delegate: Oops, something went wrong. Try again!</div>`;
        console.error("Error:", error);
    }
}


// Function to set the user's stance
function setUserPosition(position) {
    userPosition = position === "for" ? "for" : "against";
    aiPosition = userPosition === "for" ? "against" : "for";  

    const chatBox = document.getElementById("chatBox");

    // Clear previous user position messages if any
    chatBox.innerHTML = "";

    chatBox.innerHTML += `<div class="chat user"><strong>You:</strong> I am ${userPosition} the topic.</div>`;
    scrollToBottom();

    // AI acknowledges the stance
    chatBox.innerHTML += `<div class="chat ai"><strong>Delegate:</strong> I will argue ${aiPosition === "for" ? "in favor of" : "against"} the topic.</div>`;
    scrollToBottom();
}

// Function to submit a user's argument and get AI's counterargument
const SECRET_KEY = "YEGHISHEHUMUN25"; // Change this to your own secret key
const FREE_TRIAL_LIMIT = 20;
const PREMIUM_STATUS_KEY = "premiumUser";

// Check if already logged in

// Function to login
function login() {
    const inputKey = document.getElementById("adminKey").value;

    if (inputKey === SECRET_KEY || inputKey.toLowerCase() === "free") {
        localStorage.setItem("adminAccess", SECRET_KEY);
        if (inputKey.toLowerCase() === "free") {
            localStorage.setItem("userStatus", "free");
            localStorage.setItem("messageCount", 0); // Start the count from 0
        } else {
            localStorage.setItem("userStatus", "premium");
        }
        alert("Access Granted!");
        showAdminPanel();
    } else {
        alert("Wrong Key! Access Denied.");
    }
}
if (localStorage.getItem("adminAccess") === SECRET_KEY) {
    showAdminPanel();
}

// Function to show admin panel after login
function showAdminPanel() {
    document.getElementById("loginForm").classList.add("hidden");
    document.getElementById("container").classList.remove("hidden");
    initializeUser();
}

// Function to initialize user based on their status
// Function to initialize user based on their status
function initializeUser() {
    const userStatus = localStorage.getItem("userStatus");
    const messageCount = localStorage.getItem("messageCount") || 0;

    // Check if user is premium or free
    if (userStatus === "free" && messageCount >= FREE_TRIAL_LIMIT) {
        document.getElementById("submitBtn").disabled = true;
        alert("Free trial limit reached. Upgrade to premium for unlimited messages.");
    } else if (userStatus === "premium") {
        document.getElementById("submitBtn").disabled = false;
        updateMessageStatus(messageCount);
        hidePremiumSection(); // Hide the premium activation section if user is premium
    } else {
        document.getElementById("submitBtn").disabled = true;
    }

    // Update message status display for free or premium users
    updateMessageStatus(messageCount);
}

// Function to hide the "Activate Premium" section
function hidePremiumSection() {
    const premiumCodeSection = document.getElementById("premiumCodeSection");
    if (premiumCodeSection) {
        premiumCodeSection.style.display = "none"; // Hide the premium code input section
    }
}
let hasChosenStance = false;
async function submitDebate() {
    const userInput = document.getElementById("userInput").value.trim();
    const chatBox = document.getElementById("chatBox");
    const submitButton = document.getElementById("submitBtn");

    if (!userInput) return;

    chatBox.innerHTML += `<div class="chat user"><strong>You:</strong> ${userInput}</div>`;
    document.getElementById("userInput").value = "";
    scrollToBottom();

    submitButton.disabled = true;
    if (!hasChosenStance && (userInput === "for" || userInput === "against")) {
        setUserPosition(userInput);
        hasChosenStance = true;
        submitButton.disabled = false;
        return;
    }

    // **If stance is not chosen yet, ask again**
    if (!hasChosenStance) {
        chatBox.innerHTML += `<div class="chat ai"><strong>Delegate:</strong> Please state your position first: 'for' or 'against' the topic.</div>`;
        scrollToBottom();
        submitButton.disabled = false;
        return;
    }
    try {
        // Check if the free trial limit is reached before submitting the debate
        let messageCount = parseInt(localStorage.getItem("messageCount") || 0);
        const userStatus = localStorage.getItem("userStatus");

        // If the user is on a free trial and has reached the limit, prevent submission
        if (userStatus === "free" && messageCount >= FREE_TRIAL_LIMIT) {
            alert("Free trial limit reached. Upgrade to premium for unlimited messages.");
            return;
        }

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: `You are an MUN delegate taking a firm stance. The debate topic is: "${document.getElementById("topic").innerText}". The user is arguing ${userPosition}, so you must argue ${aiPosition}. Keep responses short (1-2 sentences), logical, and assertive. Keep in mind, you can be a little fun too, not only serious. Use logical proofs, although they may not be true. Very important: if the user says something unrelated to the topic and makes no sense, call them out for it.` },
                    { role: "user", content: `User's Argument: ${userInput}\nAI's Response:` }
                ]
            })
        });

        const data = await response.json();

        if (response.ok && data.choices) {
            const aiResponse = data.choices[0].message.content.trim();
            chatBox.innerHTML += `<div class="chat ai"><strong>Delegate:</strong> ${aiResponse}</div>`;
        } else {
            throw new Error("Failed to generate response.");
        }
    } catch (error) {
        chatBox.innerHTML += `<div class="chat ai error"><strong>Delegate:</strong> I couldn't process that. Try again.</div>`;
        console.error("Error:", error);
    }

    trackMessageCount(); // Update message count after submitting the argument
    scrollToBottom();
    submitButton.disabled = false;  // Re-enable the button after processing
}



// Update the message count status display
function updateMessageStatus(count) {
    let messageStatus = document.getElementById("messageStatus");

    // Create message status div if it doesn't exist
    if (!messageStatus) {
        messageStatus = document.createElement("div");
        messageStatus.id = "messageStatus";
        messageStatus.style.marginTop = "20px";
        document.getElementById("container").appendChild(messageStatus);
    }

    // Update message count text
    const userStatus = localStorage.getItem("userStatus");
    if (userStatus === "free") {
        messageStatus.innerText = `Messages Used: ${count} / ${FREE_TRIAL_LIMIT}`;
    } else {
        messageStatus.innerText = "Unlimited Messages (Premium)";
    }
}
function trackMessageCount() {
    let messageCount = localStorage.getItem("messageCount") || 0;
    messageCount = parseInt(messageCount) + 1;
    localStorage.setItem("messageCount", messageCount);
    
    // If user is free and has exceeded the limit, disable submit button
    const userStatus = localStorage.getItem("userStatus");
    if (userStatus === "free" && messageCount >= FREE_TRIAL_LIMIT) {
        document.getElementById("submitBtn").disabled = true;
        alert("Free trial limit reached. Upgrade to premium for unlimited messages.");
    } else {
        document.getElementById("submitBtn").disabled = false;
    }
    
    updateMessageStatus(messageCount); // Update UI with message count
}

// Auto-scroll to the bottom of the chat box after each message
function scrollToBottom() {
    const chatBox = document.getElementById("chatBox");
    chatBox.scrollTop = chatBox.scrollHeight;
}

function logOut() {
    localStorage.removeItem("adminAccess");
    localStorage.removeItem("userStatus");
    localStorage.removeItem("messageCount");
    alert("You have been logged out.");
    window.location.reload(); // Reloads the page and shows the login form
}
window.logOut = logOut;

// Function to activate premium if the code is valid
function activatePremiumCode() {
    const premiumCode = document.getElementById("premiumCodeInput").value.trim();
    const validPremiumCodes = JSON.parse(localStorage.getItem("validPremiumCodes")) || ["prem4876", "mun#32", "wlcoo3444"];  // Example list of valid premium codes
    const usedCodes = JSON.parse(localStorage.getItem("usedPremiumCodes")) || [];  // Get used codes from localStorage (or initialize as an empty array)

    // Check if the premium code is in the valid codes list
    const codeIndex = validPremiumCodes.indexOf(premiumCode);

    if (codeIndex === -1) {
        alert("Invalid premium code.");
        return; // Stop further execution if code is not found
    }

    // Check if the premium code has already been used
    if (usedCodes.includes(premiumCode)) {
        alert("This premium code has already been used.");
        return; // Stop further execution if code has been used
    }

    // Code is valid and hasn't been used yet
    // Grant premium access
    localStorage.setItem("userStatus", "premium");
    localStorage.setItem("messageCount", 0); // Reset message count to allow unlimited messages

    // Mark the code as used by adding it to the used codes list
    usedCodes.push(premiumCode);
    localStorage.setItem("usedPremiumCodes", JSON.stringify(usedCodes));  // Store updated list of used codes

    // Remove the used code from the valid codes list
    validPremiumCodes.splice(codeIndex, 1); // Remove the used code from the list
    localStorage.setItem("validPremiumCodes", JSON.stringify(validPremiumCodes)); // Store updated list of valid codes

    // Store the code that the user used in localStorage, so it can be checked on login
    localStorage.setItem("usedPremiumCode", premiumCode);

    alert("Premium access granted!");
    updateMessageStatus(0); // Update message status to reflect unlimited messages
    document.getElementById("submitBtn").disabled = false; // Enable submit button if it was disabled
    hidePremiumSection(); // Hide the premium activation section

    // Clear input field after submission
    document.getElementById("premiumCodeInput").value = "";
}

function checkIfUserHasPremium() {
    // Check if the user has already used a premium code
    const usedPremiumCode = localStorage.getItem("usedPremiumCode");

    if (usedPremiumCode) {
        // If a code was used, prompt the user to enter the same code again
        const userEnteredCode = prompt("Please enter your premium code to log back in:");

        if (userEnteredCode === usedPremiumCode) {
            alert("Logged in with premium access.");
            localStorage.setItem("userStatus", "premium");
            localStorage.setItem("messageCount", 0); // Reset message count to allow unlimited messages
        } else {
            alert("Incorrect code. You must use the same code that was used previously.");
        }
    } else {
        alert("No premium code found. Please enter a valid code.");
    }
}


