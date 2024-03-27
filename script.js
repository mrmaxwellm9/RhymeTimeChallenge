// Define variables
let wordsAndRhymes = {}; // Your dictionary of words and rhymes
let currentWord = '';
let score = 0;
let timeLeft;
let timerInterval;
let usedWords = [];
let commonWords = [];

// Check if the words are already stored in localStorage
if (!localStorage.getItem('commonWords')) {
    // Read the content of the "commonWords.txt" file
    fetch('commonWords.txt')
        .then(response => response.text())
        .then(data => {
            // Split the text into an array of words (assuming each word is on a separate line)
            let wordsArray = data.split('\n').map(word => word.trim());

            // Store the array of words in the localStorage
            localStorage.setItem('commonWords', JSON.stringify(wordsArray));

            console.log('Words stored in localStorage:', wordsArray);

            // Assign the wordsArray to commonWords
            commonWords = wordsArray;
        })
        .catch(error => console.error('Error reading the file:', error));
} else {
    console.log('Words already stored in localStorage.');

    // Retrieve the array from localStorage and parse it
    commonWords = JSON.parse(localStorage.getItem('commonWords'));
}


// Function to open IndexedDB database
function openDatabase() {
    return new Promise((resolve, reject) => {
        let request = window.indexedDB.open('RhymeDictionary', 1);

        request.onerror = function(event) {
            console.error("Error opening database:", event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = function(event) {
            let db = event.target.result;
            resolve(db);
        };

        request.onupgradeneeded = function(event) {
            let db = event.target.result;
            let objectStore = db.createObjectStore('words', { keyPath: 'word' });
            objectStore.createIndex('rhymes', 'rhymes', { unique: false });
        };
    });
}

// Function to store dictionary in IndexedDB
function storeDictionary(dictionary) {
    openDatabase().then(db => {
        let transaction = db.transaction(['words'], 'readwrite');
        let objectStore = transaction.objectStore('words');

        // Convert dictionary to array of objects for storage
        let data = Object.entries(dictionary).map(([word, rhymes]) => ({ word: word, rhymes: JSON.stringify(rhymes) }));

        // Clear existing data
        objectStore.clear();

        // Add data to object store
        data.forEach(entry => {
            objectStore.put(entry);
        });
    }).catch(error => console.error("Error opening database:", error));
}

// Function to load the dictionary from IndexedDB
function loadDictionary(callback) {
    openDatabase().then(db => {
        let transaction = db.transaction(['words'], 'readonly');
        let objectStore = transaction.objectStore('words');
        let request = objectStore.getAll();

        request.onsuccess = function(event) {
            let dictionary = {};
            event.target.result.forEach(entry => {
                dictionary[entry.word] = JSON.parse(entry.rhymes);
            });

            console.log("Dictionary loaded:", dictionary); // Print dictionary to console

            callback(dictionary);
        };

        request.onerror = function(event) {
            console.error("Error loading dictionary:", event.target.error);
        };
    }).catch(error => console.error("Error opening database:", error));
}



// Start the game after loading the dictionary
loadDictionary(function(dictionary) {
    if (Object.keys(dictionary).length === 0) {
        // If dictionary is empty (first time), fetch from file and store in IndexedDB
        fetch('combined_dictionary.txt') // Adjust path if needed
            .then(response => response.text())
            .then(data => {
                let lines = data.split('\n');
                let newDictionary = {};
                lines.forEach(line => {
                    let parts = line.split(':');
                    let word = parts[0].trim();
                    let rhymes = parts[1].trim().slice(1, -1).split(',').map(rhyme => rhyme.trim().replace(/'/g, ''));
                    newDictionary[word] = rhymes;
                });

                // Store dictionary in IndexedDB
                storeDictionary(newDictionary);

                // Use the newly loaded dictionary
                wordsAndRhymes = newDictionary;

                // Add event listener for daily mode button if it exists
                let dailyModeBtn = document.getElementById('dailyModeBtn');
                if (dailyModeBtn) {
                    dailyModeBtn.addEventListener('click', startDailyMode);
                }
            })
            .catch(error => console.error('Error loading dictionary:', error));
    } else {
        // Use dictionary from IndexedDB
        wordsAndRhymes = dictionary;

        // Add event listener for daily mode button if it exists
        let dailyModeBtn = document.getElementById('dailyModeBtn');
        if (dailyModeBtn) {
            dailyModeBtn.addEventListener('click', startDailyMode);
        }
    }
});


// Function to start the game
function startGame() {
    clearUsedWords();
    document.getElementById("notFoundRhymes").innerText = '';

    // Choose a random word as the starting word
    let randomIndex = Math.floor(Math.random() * commonWords.length); // Generate a random index
    currentWord = commonWords[randomIndex]; // Select a random word from commonWords
    displayWord(currentWord);

    // Set timer based on selected mode
    let gameTime = 60; // Placeholder, implement logic to set time based on mode
    timeLeft = gameTime;
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
}


// Function to display the current word
function displayWord(word) {
    // Clear previous word and display current word
    document.getElementById('gameArea').innerText = word;
}

// Function to add a word to the used words list
function addUsedWord(word) {
    // Create a new list item element
    document.getElementById('gameArea').innerText += ", " + word;
    usedWords.push(word);
}

// Function to clear the used words list
function clearUsedWords() {
    // Clear all child elements from the used words list
    document.getElementById('gameArea').innerText = "";
    usedWords = [];
}

// Function to update timer
function updateTimer() {
    if (timeLeft < 0) {
        clearInterval(timerInterval);
        endGame();
    } else {
        document.getElementById('timeLeft').innerText = timeLeft;
        timeLeft--;
    }
}

// Function to handle user submission
function submitGuess() {
    let guess = document.getElementById('guessInput').value.trim().toLowerCase();
    if (guess === '') return;
    // Check if guess is a valid rhyme
    if (wordsAndRhymes[currentWord].includes(guess) && !usedWords.includes(guess)) {
        score++;
        document.getElementById('scoreValue').innerText = score;
        new Audio('correct.mp3').play();
        addUsedWord(guess);
    } else {
        new Audio('incorrect.mp3').play();
    }

    document.getElementById('guessInput').value = ''; // Clear input box
}

document.getElementById('guessInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        submitGuess(); // Submit guess
    }
});
// Function to end the game
function endGame() {
    let availableRhymes = wordsAndRhymes[currentWord].filter(rhyme => !usedWords.includes(rhyme));
    document.getElementById("notFoundRhymes").innerText = 'Available Rhymes: ' + availableRhymes
}
