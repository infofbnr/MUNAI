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
const encodedKey = "AAJAAB4KAUgbAjkkJTQnXj8jMlwpFRQjA1MrIyYXIC1dJzMuEh8rBChXXTIXOgxcQVtWBCNOHDYUQ14HCi8MGCM8Rwk0HxYcMCwZQzsyAwYmFz1eMgAHACMzKT4eQhkOXQcaIlBcCDUmPlEJMT8EHQEdKgIRQAU5MwZUOQQNKQ1fGAEAGCwgRAIIHRVTIhMrBhE5HlRQGQomIz4dGilRX1xIRyg=" ;
const apiKey = simpleDecode(encodedKey);

let aiPosition = "";
let userPosition = ""; 

async function generateDebateTopic() {
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
                        content: `Generate funny topics for an MUN debate. Imagine you are a master at making topics for an MUN debate, and you can give so creative topics that users will love a lot. For example: Pineapple belongs on pizza. or, Winter is better than summer... etc. Don't repeat the same topic twice, be original and creative.`

                    },
                    { role: "user", content: "Give me a one-line debate topic that is fair and engaging, and **not a question**." }
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
    aiPosition = userPosition === "for" ? "against" : "for";  // AI takes the opposite position

    const chatBox = document.getElementById("chatBox");
    chatBox.innerHTML += `<div class="chat user"><strong>You:</strong> I am ${userPosition} the topic.</div>`;
    scrollToBottom();

    // Now the user has set their stance, AI will respond accordingly
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

async function submitDebate() {
    const userInput = document.getElementById("userInput").value.trim();
    const chatBox = document.getElementById("chatBox");
    const submitButton = document.getElementById("submitBtn");

    if (!userInput) return;

    chatBox.innerHTML += `<div class="chat user"><strong>You:</strong> ${userInput}</div>`;
    document.getElementById("userInput").value = "";
    scrollToBottom();

    submitButton.disabled = true;

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
                    { role: "system", content: `You are an MUN delegate taking a firm stance. The debate topic is: "${document.getElementById("topic").innerText}". The user is arguing ${userPosition}, so you must argue ${aiPosition}. Keep responses short (1-2 sentences), logical, and assertive. Keep in mind, you can be a little fun too, not only serious. Use logical proofs, although they may not be true.` },
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
    const validPremiumCode = "premium34343"; // This is the code for premium access

    if (premiumCode === validPremiumCode) {
        localStorage.setItem("userStatus", "premium");
        localStorage.setItem("messageCount", 0); // Reset message count to allow unlimited messages
        alert("Premium access granted!");
        updateMessageStatus(0); // Update message status to reflect unlimited messages
        document.getElementById("submitBtn").disabled = false; // Enable submit button if it was disabled
        hidePremiumSection(); // Hide the premium activation section
    } else {
        alert("Invalid premium code.");
    }

    // Clear input field after submission
    document.getElementById("premiumCodeInput").value = "";
}
