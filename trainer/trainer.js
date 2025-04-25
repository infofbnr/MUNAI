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

async function getMotions() {
    const res = await fetch('motions.json');
    return await res.json();
}
let currentAnswer = "";
let timerInterval;
let totalRounds = 5;
let correctCount = 0;
let currentRoundIndex = 0;
async function fetchWithRetry(url, options, retries = 3, delay = 1000) {
    try {
        const response = await fetch(url, options);
        if (response.status === 429 && retries > 0) {
            console.warn("Rate limited. Retrying...");
            await new Promise(res => setTimeout(res, delay));
            return fetchWithRetry(url, options, retries - 1, delay * 2);
        }
        return response;
    } catch (err) {
        throw new Error("Fetch failed: " + err.message);
    }
}

async function generateRound() {
    const motionsData = await getMotions();
    const categories = Object.keys(motionsData);
    
    // Get 5 unique random items
    const selectedItems = [];
    const usedKeys = new Set();

    while (selectedItems.length < 5) {
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const items = motionsData[randomCategory];
        const itemNames = Object.keys(items);
        const randomKey = itemNames[Math.floor(Math.random() * itemNames.length)];

        const uniqueID = `${randomCategory}-${randomKey}`;
        if (!usedKeys.has(uniqueID)) {
            usedKeys.add(uniqueID);
            selectedItems.push({
                category: randomCategory,
                motion: randomKey,
                description: items[randomKey]
            });
        }
    }

    const combinedPrompt = `
You are a Model United Nations (MUN) assistant. Below are 5 motions or points. For each one, write a short, realistic, and unique scenario that would make it appropriate, but **do not** mention the motion/point name or hint at it. Write each scenario in 1–2 sentences.

Format your response like:
1. [Scenario text]
2. [Scenario text]
...and so on. Do NOT include the motion names or any explanation.

${selectedItems.map((item, i) => `
${i + 1}.
Category: ${item.category}  
Motion/Point: ${item.motion}  
Description: "${item.description}"`).join("\n")}
`;

    const response = await fetchWithRetry("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: combinedPrompt }]
        })
    });

    const data = await response.json();
    const scenarios = data.choices[0].message.content
        .split(/\n\d+\.\s/)
        .filter(Boolean)
        .slice(0, 5);

    // Merge with selected items
    roundData = selectedItems.map((item, i) => ({
        ...item,
        scenario: scenarios[i],
        answer: item.motion.toLowerCase()
    }));

    currentRoundIndex = 0;
    correctCount = 0;
    showScenario();
}


function showScenario() {
    const current = roundData[currentRoundIndex];
    currentAnswer = current.answer;

    document.getElementById("scenarioBox").innerText = current.scenario;
    document.getElementById("feedback").innerText = "";

    const motionsData = roundData.map(x => x.motion);
    const otherOptions = roundData
        .map(x => x.motion.toLowerCase())
        .filter(opt => opt !== currentAnswer)
        .sort(() => 0.5 - Math.random())
        .slice(0, 2);

    const options = [currentAnswer, ...otherOptions].sort(() => 0.5 - Math.random());

    const choicesDiv = document.getElementById("choices");
    choicesDiv.innerHTML = "";

    options.forEach(option => {
        const btn = document.createElement("button");
        btn.innerText = option;
        btn.className = "bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded";
        btn.onclick = () => handleChoice(option);
        choicesDiv.appendChild(btn);
    });

    // Start timer
    let timeLeft = 10;
    const timerDisplay = document.getElementById("timer");
    timerDisplay.innerText = `Time left: ${timeLeft}s`;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = `Time left: ${timeLeft}s`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            document.querySelectorAll("#choices button").forEach(btn => btn.disabled = true);
            document.getElementById("feedback").innerText = `⏰ Time's up! The correct answer was: ${currentAnswer}`;
            document.getElementById("feedback").classList.remove("text-green-600");
            document.getElementById("feedback").classList.add("text-red-600");
            setTimeout(nextScenario, 1500);
        }
    }, 1000);
}

function handleChoice(selected) {
    clearInterval(timerInterval);
    const feedback = document.getElementById("feedback");
    const scoreCounter = document.getElementById("scoreCounter");
    const buttons = document.querySelectorAll("#choices button");

    buttons.forEach(btn => btn.disabled = true);

    if (selected === currentAnswer) {
        correctCount++;
        feedback.innerText = "✅ Correct!";
        feedback.classList.remove("text-red-600");
        feedback.classList.add("text-green-600");
    } else {
        feedback.innerText = `❌ Incorrect. The correct answer was: ${currentAnswer}`;
        feedback.classList.remove("text-green-600");
        feedback.classList.add("text-red-600");
    }

    scoreCounter.innerText = `Score: ${correctCount}/${totalRounds}`;
    setTimeout(nextScenario, 1500);
}

function nextScenario() {
    currentRoundIndex++;
    if (currentRoundIndex < roundData.length) {
        showScenario();
    } else {
        document.getElementById("feedback").innerText = "🎉 You completed the round!";
        document.getElementById("newScenarioBtn").disabled = true;
        document.getElementById("restartBtn").classList.remove("hidden");
    }
}

function restartGame() {
    document.getElementById("restartBtn").classList.add("hidden");
    document.getElementById("newScenarioBtn").disabled = false;
    generateRound();
}

// Call this function when you want to start the game.
generateRound();
