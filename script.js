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

// Check if the words from rhyming_words.txt are already stored in localStorage
if (!localStorage.getItem('rhymingWords')) {
    // Read the content of the "rhyming_words.txt" file
    fetch('rhyming_words.txt')
        .then(response => response.text())
        .then(data => {
            // Split the text into an array of lines
            let lines = data.split('\n');
            let setsArray = [];

            // Iterate over each line and split it into words
            lines.forEach(line => {
                let wordsInLine = line.split(',').map(word => word.trim());
                let lineSet = new Set(wordsInLine);
                setsArray.push(Array.from(lineSet));
            });

            // Store the array of sets in the localStorage
            localStorage.setItem('rhymingWords', JSON.stringify(setsArray));

            console.log('Rhyming words stored in localStorage:', setsArray);
        })
        .catch(error => console.error('Error reading the file:', error));
} else {
    console.log('Rhyming words already stored in localStorage.');
}

function startGame() {
    clearUsedWords();
    gameOver = false;
    score = 0;
    document.getElementById('scoreValue').innerText = score;
    document.getElementById("notFoundRhymes").innerText = '';

    startTime = Date.now();

    let mode = $('#mode .cursor-pointer.active').text();
    let selectedTimeLimit = $('#time .cursor-pointer.active').text();

    if (selectedTimeLimit === 'Custom') {
        let customTimeLimit = $('.form-control').val();
        if (!isNaN(customTimeLimit)) {
            timeLeft = customTimeLimit;
        } else {
            timeLeft = 60; // Default to 60 seconds if invalid input or canceled
        }
    } else {
        timeLeft = parseInt(selectedTimeLimit);
    }
    
    if (mode === 'Normal Mode') {
        // Retrieve a random word from commonWords for normal mode
        currentWord = commonWords[Math.floor(Math.random() * commonWords.length)];
        let storedRhymingWords = JSON.parse(localStorage.getItem('rhymingWords'));
    
        if (storedRhymingWords) {
            // Filter rhyming words based on the current word
            let regex = new RegExp(`\\b${currentWord}(?:,|\\n|$)`, 'i');
            wordSet = storedRhymingWords.find(line => line.some(word => regex.test(word)));
        } else {
            console.error('Rhyming words not found in localStorage.');
        }
    
        displayWord(currentWord);
        usedWords.push(currentWord);
    } else if (mode === 'Challenge Mode') {
        // Retrieve all rhyming words from localStorage
        let storedRhymingWords = JSON.parse(localStorage.getItem('rhymingWords'));
    
        if (storedRhymingWords) {
            // Select a random line from the stored rhyming words
            let randomLine = storedRhymingWords[Math.floor(Math.random() * storedRhymingWords.length)];
            wordSet = randomLine;
            // Select a random word from the line
            currentWord = randomLine[Math.floor(Math.random() * randomLine.length)];
            displayWord(currentWord);
            usedWords.push(currentWord);
        } else {
            console.error('Rhyming words not found in localStorage.');
        }
    }
    
   
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
    console.log(wordSet);
    console.log(usedWords);
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
    let rhymesDisplay = document.getElementById("notFoundRhymes");
    if (document.getElementById("showRhymesBtn").classList.contains("active")) {
        rhymesDisplay.innerText = 'Available Rhymes:\n' + availableRhymes.join(', ');
        rhymesDisplay.classList.remove("hidden");
    } else {
        rhymesDisplay.classList.add("hidden");
    }
    new Audio('game_over.mp3').play();
    gameOver = true;
}

function setActive(clickedElement) {
    $(clickedElement).siblings('.cursor-pointer').removeClass('active');
    $(clickedElement).siblings('.custom-input-column').find('span').removeClass('active');
    $(clickedElement).addClass('active');
}

function setActiveCustom(clickedElement) {
    $(clickedElement).parent().parent().parent().siblings('.cursor-pointer').removeClass('active');
    $(clickedElement).addClass('active');
}

// Get the information icon and the popup
var informationIcon = document.getElementById("information");
var infoPopup = document.getElementById("infoPopup");

// When the information icon is clicked, toggle the popup
informationIcon.addEventListener("click", function(event) {
    event.stopPropagation(); // Prevent the click event from propagating to the window
    infoPopup.classList.toggle("open");
});

// Close the popup when clicking outside of it
window.addEventListener("click", function(event) {
    if (!infoPopup.contains(event.target) && infoPopup.classList.contains("open")) {
        infoPopup.classList.remove("open");
    }
});

// When the close button is clicked, hide the popup
var closeButton = document.querySelector(".popup .close");
closeButton.addEventListener("click", function() {
    infoPopup.classList.remove("open");
});

function toggleRhymes() {
    let rhymesDisplay = document.getElementById("notFoundRhymes");
    rhymesDisplay.classList.toggle("hidden");
    let showRhymesBtn = document.getElementById("showRhymesBtn");
    showRhymesBtn.classList.toggle("active");
    if (gameOver) {
        let availableRhymes = wordSet.filter(rhyme => !usedWords.includes(rhyme));
        if (showRhymesBtn.classList.contains("active")) {
            rhymesDisplay.innerText = 'Available Rhymes:\n' + availableRhymes.join(', ');
            rhymesDisplay.classList.remove("hidden");
        } else {
            rhymesDisplay.classList.add("hidden");
        }
    }
}