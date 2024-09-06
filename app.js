let words = [];
let selectedEnglish = null;
let selectedFrench = null;
let matchCount = 0; // Track the number of correct matches made
let timer = 120; // 2 minutes = 120 seconds
let timerInterval;

window.onload = () => {
    fetchWords();
    startTimer();
};

// Fetch words from words.json
function fetchWords() {
    fetch('words.json') // Load the JSON file containing words
        .then(response => response.json())
        .then(data => {
            words = data; // Store the words in the `words` array
            startGame();  // Start the game once words are loaded
        })
        .catch(error => {
            console.error('Error fetching the word list:', error);
        });
}

// Start the game with the shuffled words
function startGame() {
    const frenchColumn = document.getElementById('french-words');
    const englishColumn = document.getElementById('english-words');

    // Shuffle the word list and select 5 word pairs to create 5 rows
    const shuffledWords = shuffleUniquePairs([...words]).slice(0, 5);

    // Split the words into two separate arrays for French and English words
    let frenchWords = shuffledWords.map(word => word.french);
    let englishWords = shuffledWords.map(word => word.english);

    // Shuffle both arrays to randomize their positions
    frenchWords = shuffle(frenchWords);
    englishWords = shuffle(englishWords);

    // Clear previous words before repopulating
    frenchColumn.innerHTML = '';
    englishColumn.innerHTML = '';

    // Add the French words to the French column and the English words to the English column
    frenchWords.forEach(frenchWord => {
        createWordElement(frenchWord, shuffledWords.find(word => word.french === frenchWord).english, frenchColumn, 'french');
    });
    englishWords.forEach(englishWord => {
        createWordElement(englishWord, shuffledWords.find(word => word.english === englishWord).french, englishColumn, 'english');
    });

    // Reset match count
    matchCount = 0;

    // Attach event listeners to all created word elements
    attachEventListeners();
}

// Ensure unique word pairs are selected (no duplicates)
function shuffleUniquePairs(array) {
    const shuffled = shuffle(array);
    const uniquePairs = [];

    while (uniquePairs.length < 5 && shuffled.length > 0) {
        const pair = shuffled.pop();
        if (!uniquePairs.some(item => item.french === pair.french || item.english === pair.english)) {
            uniquePairs.push(pair);
        }
    }
    return uniquePairs;
}

// Create a word element and add it to the column
function createWordElement(word, match, container, language) {
    const div = document.createElement('div');
    div.classList.add('grid-item');
    div.innerText = word;
    div.dataset.language = language;
    div.dataset.word = word;
    div.dataset.match = match;

    container.appendChild(div);
}

// Shuffle the words
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Attach event listeners to the word elements
function attachEventListeners() {
    const frenchColumn = document.getElementById('french-words');
    const englishColumn = document.getElementById('english-words');
    const allWords = [...frenchColumn.children, ...englishColumn.children];

    allWords.forEach(word => word.addEventListener('click', () => selectWord(word)));
}

// Handle word selection
function selectWord(div) {
    if (div.classList.contains('matched')) return; // Ignore matched words

    if (div.dataset.language === 'english') {
        if (selectedEnglish) selectedEnglish.classList.remove('selected');
        selectedEnglish = div;
    } else {
        if (selectedFrench) selectedFrench.classList.remove('selected');
        selectedFrench = div;
    }

    div.classList.add('selected');

    // Check for a match
    if (selectedEnglish && selectedFrench) {
        if (selectedEnglish.dataset.word === selectedFrench.dataset.match) {
            handleCorrectMatch();
        } else {
            setTimeout(resetSelection, 500); // Reset after a short delay
        }
    }
}

// Handle a correct match
function handleCorrectMatch() {
    selectedEnglish.classList.remove('selected');
    selectedFrench.classList.remove('selected');
    selectedEnglish.classList.add('matched');
    selectedFrench.classList.add('matched');
    selectedEnglish.style.backgroundColor = 'rgba(0, 123, 255, 0.5)'; // Pale blue
    selectedFrench.style.backgroundColor = 'rgba(0, 123, 255, 0.5)'; // Pale blue

    selectedEnglish = null;
    selectedFrench = null;

    matchCount++;

    // After 5 correct matches, reset the game with new words
    if (matchCount === 5) {
        setTimeout(startGame, 1000); // Reset game after 1 second
    }
}

// Reset the selected words' style when there's no match
function resetSelection() {
    if (selectedEnglish) {
        selectedEnglish.classList.remove('selected');
        selectedEnglish = null;
    }
    if (selectedFrench) {
        selectedFrench.classList.remove('selected');
        selectedFrench = null;
    }
}

// Timer functionality
function startTimer() {
    const timerDisplay = document.getElementById('timer');
    const timerBar = document.getElementById('timer-bar');
    const totalWidth = 100; // Start with 100% width

    timerInterval = setInterval(() => {
        timer--;
        let percentage = (timer / 120) * 100; // Calculate remaining percentage
        timerBar.style.width = percentage + '%';

        if (timer === 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

// End the game when the timer hits zero
function endGame() {
    alert("Time's up! The game is over.");
    const frenchColumn = document.getElementById('french-words');
    const englishColumn = document.getElementById('english-words');

    // Disable all words from being selected
    const allWords = [...frenchColumn.children, ...englishColumn.children];
    allWords.forEach(word => {
        word.removeEventListener('click', selectWord);
    });
}
