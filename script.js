// Define variables
let wordSet = []; // Your dictionary of words and rhymes
let currentWord = '';
let score = 0;
let timeLeft;
let timerInterval;
let usedWords = [];
let commonWords = [];
let startTime;
let gameOver;

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

function startGame() {
    clearUsedWords();
    gameOver = false;
    document.getElementById("notFoundRhymes").innerText = '';

    startTime = Date.now();

    currentWord = commonWords[Math.floor(Math.random() * commonWords.length)];
    displayWord(currentWord);

    // Fetch the word set containing the current word
    fetch('rhyming_words.txt')
        .then(response => response.text())
        .then(data => {
            // Split the text into an array of lines and filter the lines containing the current word
            let regex = new RegExp(`\\s${currentWord}(?:\\n|,)`, 'i');
            wordSet = data.split('\n').filter(line => regex.test(line)).flatMap(line => line.split(/,\s|\n/)).map(word => word.trim());
        })
        .catch(error => console.error('Error reading the file:', error));

    usedWords.push(currentWord);
    

    // Set timer based on selected mode
    let gameTime = 60;
    timeLeft = gameTime;
    updateTimer();
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
    let currentTime = Date.now();
    let elapsedTime = Math.floor((currentTime - startTime) / 1000); // Convert milliseconds to seconds

    if (elapsedTime > timeLeft) {
        clearInterval(timerInterval);
        endGame();
    } else {
        let remainingTime = timeLeft - elapsedTime;
        document.getElementById('timeLeft').innerText = remainingTime;
        setTimeout(updateTimer, 1000); // Schedule the next iteration after 1 second
    }
}

// Function to handle user submission
function submitGuess() {
    let guess = document.getElementById('guessInput').value.trim().toLowerCase();
    if (guess === '') return;
    // Check if guess is a valid rhyme
    if (!gameOver && wordSet.includes(guess) && !usedWords.includes(guess)) {
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
    let availableRhymes = wordSet.filter(rhyme => !usedWords.includes(rhyme));
    document.getElementById("notFoundRhymes").innerText = 'Available Rhymes: ' + availableRhymes
    gameOver = true;
}
