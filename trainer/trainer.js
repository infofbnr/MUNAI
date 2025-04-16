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

async function getMotions() {
    const res = await fetch('motions.json');
    return await res.json();
}
let currentAnswer = "";
let correctCount = 0;
const totalRounds = 5;

async function getScenario() {
    const scenarioBox = document.getElementById("scenarioBox");
    const feedback = document.getElementById("feedback");
    const userInput = document.getElementById("userAnswer");

    // Clear previous feedback and user answer.
    feedback.innerText = "";
    userInput.value = "";
    scenarioBox.innerText = "Generating scenario..."; // Loading indicator

    // Load motions and points from the JSON file.
    const motionsData = await getMotions();
    
    // Get the category keys from the JSON ("Points" and "Motions")
    const categories = Object.keys(motionsData);
    // Randomly pick one of the categories.
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // Get the list of items from the selected category.
    const items = motionsData[randomCategory];
    // Get all keys (names of motions or points) within that category.
    const itemNames = Object.keys(items);
    // Randomly select one motion or point.
    const randomKey = itemNames[Math.floor(Math.random() * itemNames.length)];
    // Get its description.
    const description = items[randomKey];
    
    // Set the current answer. We lowercase and trim for consistent comparison later.
    currentAnswer = randomKey.toLowerCase().trim();

    // Build the prompt. We tell the AI to generate a realistic scenario

    const prompt = `
    You are a Model United Nations (MUN) assistant. Below is a list of valid motions and points used in our MUN committee. Each has a category and a description. Use only these to create scenarios.
    
    Your task is to generate a **realistic and unique MUN scenario** that would require a delegate to respond using **only the specific motion or point provided below**. The scenario should make it clear **why** the motion or point would be appropriate, but **should not mention or hint at the correct answer**. The scenario must be short — no more than two sentences.
    
    Do **NOT** include the answer or label it in any way.
    Do **NOT** write "Scenario:" or "Answer:".
    Write only the scenario.
    Do **NOT** repeat past scenarios.
    
    Here is the motion or point to build the scenario around:
    
    Category: ${randomCategory}  
    Motion/Point: ${randomKey}  
    Description: "${description}"
    `;
    
    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o-mini", 
                messages: [{ role: "user", content: prompt }]
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content.trim();
        scenarioBox.innerText = content;
        console.log(currentAnswer); // For debugging purposes
    } catch (err) {
        scenarioBox.innerText = "Failed to load scenario. Try again.";
        console.error("Error generating scenario:", err);
    }
}


function submitAnswer() {
    const userInput = document.getElementById("userAnswer").value.trim().toLowerCase();
    const feedback = document.getElementById("feedback");
    const scoreCounter = document.getElementById("scoreCounter");
  
    if (!currentAnswer) return;
  
    if (userInput === currentAnswer) {
      correctCount++;
      feedback.innerText = "✅ Correct!";
      feedback.classList.remove("text-red-600");
      feedback.classList.add("text-green-600");
  
      scoreCounter.innerText = `Score: ${correctCount}/${totalRounds}`;
  
      if (correctCount < totalRounds) {
        setTimeout(() => {
          feedback.innerText = "";
          getScenario();
        }, 1000);
      } else {
        feedback.innerText = "🎉 You completed the round!";
        document.getElementById("newScenarioBtn").disabled = true;
        document.getElementById("restartBtn").classList.remove("hidden");
      }
    } else {
      feedback.innerText = "❌ Incorrect. Try again!";
      feedback.classList.remove("text-green-600");
      feedback.classList.add("text-red-600");
    }
  }

function restartGame() {
  correctCount = 0;
  document.getElementById("scoreCounter").innerText = "Score: 0/5";
  document.getElementById("feedback").innerText = "";
  document.getElementById("userAnswer").value = "";
  document.getElementById("newScenarioBtn").disabled = false;
  document.getElementById("restartBtn").classList.add("hidden");
  getScenario();
}
