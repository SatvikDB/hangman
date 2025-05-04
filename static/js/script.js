document.addEventListener('DOMContentLoaded', () => {
    // Game variables
    let wins = 0;
    let losses = 0;
    let currentDifficulty = "easy";
    
    // DOM elements
    const wordDisplay = document.getElementById('word-display');
    const messageEl = document.getElementById('message');
    const attemptsLeft = document.getElementById('attempts-left');
    const guessedLettersContainer = document.getElementById('guessed-letters-container');
    const keyboard = document.getElementById('keyboard');
    const newGameBtn = document.getElementById('new-game-btn');
    const winsEl = document.getElementById('wins');
    const lossesEl = document.getElementById('losses');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    const hangmanParts = document.querySelectorAll('.hangman-part');
    
    // Initialize the game
    function initGame() {
        // Create keyboard
        createKeyboard();
        
        // Start a new game
        newGame();
        
        // Event listeners
        newGameBtn.addEventListener('click', newGame);
        
        // Difficulty buttons
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentDifficulty = btn.dataset.difficulty;
                newGame();
            });
        });
    }
    
    // Create keyboard
    function createKeyboard() {
        const letters = 'abcdefghijklmnopqrstuvwxyz';
        
        keyboard.innerHTML = '';
        
        for (const letter of letters) {
            const button = document.createElement('button');
            button.textContent = letter;
            button.classList.add('key');
            button.dataset.letter = letter;
            button.addEventListener('click', () => handleGuess(letter));
            keyboard.appendChild(button);
        }
        
        // Add keyboard event listener
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            if (/^[a-z]$/.test(key)) {
                handleGuess(key);
            }
        });
    }
    
    // Start a new game
    async function newGame() {
        try {
            const response = await fetch('/api/new-game', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ difficulty: currentDifficulty }),
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const gameState = await response.json();
            updateGameUI(gameState);
            resetKeyboard();
            resetHangman();
            messageEl.textContent = '';
            messageEl.style.color = '#2c3e50';
        } catch (error) {
            console.error('Error starting new game:', error);
            messageEl.textContent = 'Error starting game. Please try again.';
            messageEl.style.color = '#e74c3c';
        }
    }
    
    // Handle a letter guess
    async function handleGuess(letter) {
        try {
            const response = await fetch('/api/guess', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ letter }),
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const gameState = await response.json();
            updateGameUI(gameState);
            
            // Update keyboard
            const keyEl = document.querySelector(`.key[data-letter="${letter}"]`);
            keyEl.classList.add('used');
            
            if (gameState.word.includes(letter)) {
                keyEl.classList.add('correct');
            } else {
                keyEl.classList.add('incorrect');
            }
            
            // Check game over conditions
            if (gameState.game_over) {
                if (gameState.won) {
                    wins++;
                    winsEl.textContent = wins;
                    messageEl.textContent = 'Congratulations! You won!';
                    messageEl.style.color = '#2ecc71';
                } else {
                    losses++;
                    lossesEl.textContent = losses;
                    messageEl.textContent = `Game over! The word was: ${gameState.word}`;
                    messageEl.style.color = '#e74c3c';
                }
            }
        } catch (error) {
            console.error('Error making guess:', error);
            messageEl.textContent = 'Error making guess. Please try again.';
            messageEl.style.color = '#e74c3c';
        }
    }
    
    // Update the game UI based on game state
    function updateGameUI(gameState) {
        // Update word display
        wordDisplay.textContent = gameState.word.split('').join(' ');
        
        // Update attempts left
        attemptsLeft.textContent = gameState.remaining_attempts;
        
        // Update hangman drawing
        updateHangman(gameState.incorrect_guesses);
        
        // Update guessed letters
        updateGuessedLetters(gameState.guessed_letters, gameState.word);
    }
    
    // Update guessed letters
    function updateGuessedLetters(guessedLetters, word) {
        guessedLettersContainer.innerHTML = '';
        
        for (const letter of guessedLetters) {
            const span = document.createElement('span');
            span.textContent = letter;
            span.classList.add('guessed-letter');
            
            if (word.includes(letter)) {
                span.style.backgroundColor = '#2ecc71';
                span.style.color = 'white';
            } else {
                span.style.backgroundColor = '#e74c3c';
                span.style.color = 'white';
            }
            
            guessedLettersContainer.appendChild(span);
        }
    }
    
    // Update hangman drawing
    function updateHangman(incorrectGuesses) {
        // Reset hangman first
        resetHangman();
        
        // Show parts based on incorrect guesses
        for (let i = 0; i < incorrectGuesses && i < hangmanParts.length; i++) {
            hangmanParts[i].style.display = 'block';
        }
    }
    
    // Reset hangman drawing
    function resetHangman() {
        hangmanParts.forEach(part => {
            part.style.display = 'none';
        });
    }
    
    // Reset keyboard
    function resetKeyboard() {
        document.querySelectorAll('.key').forEach(key => {
            key.classList.remove('used', 'correct', 'incorrect');
        });
    }
    
    // Initialize the game
    initGame();
});