from flask import Flask, render_template, request, jsonify
import random
import json

app = Flask(__name__)

class Hangman:
    def __init__(self):
        self.word_lists = {
            "easy": [
                "cat", "dog", "sun", "moon", "book", "tree", "fish", "bird", "cake",
                "ball", "home", "car", "star", "milk", "game", "hat", "pen", "cup"
            ],
            "medium": [
                "python", "coding", "program", "browser", "keyboard", "monitor", "website",
                "internet", "computer", "software", "function", "variable", "object", "method"
            ],
            "hard": [
                "algorithm", "javascript", "developer", "framework", "database", "inheritance",
                "encryption", "authentication", "deployment", "middleware", "repository", "architecture"
            ]
        }
        self.reset_game("easy")
    
    def reset_game(self, difficulty="easy"):
        self.difficulty = difficulty
        self.word = random.choice(self.word_lists[difficulty]).lower()
        self.guessed_letters = set()
        self.incorrect_guesses = 0
        self.max_attempts = 6
        self.game_over = False
        self.won = False
        return self.get_game_state()
    
    def guess(self, letter):
        if self.game_over:
            return self.get_game_state()
        
        letter = letter.lower()
        
        if letter in self.guessed_letters:
            return self.get_game_state()
        
        self.guessed_letters.add(letter)
        
        if letter not in self.word:
            self.incorrect_guesses += 1
            
        # Check if player has won
        if all(letter in self.guessed_letters for letter in self.word):
            self.won = True
            self.game_over = True
        
        # Check if player has lost
        if self.incorrect_guesses >= self.max_attempts:
            self.game_over = True
        
        return self.get_game_state()
    
    def get_masked_word(self):
        return ''.join([letter if letter in self.guessed_letters else '_' for letter in self.word])
    
    def get_game_state(self):
        return {
            "word": self.word if self.game_over else self.get_masked_word(),
            "guessed_letters": sorted(list(self.guessed_letters)),
            "incorrect_guesses": self.incorrect_guesses,
            "remaining_attempts": self.max_attempts - self.incorrect_guesses,
            "game_over": self.game_over,
            "won": self.won,
            "difficulty": self.difficulty
        }

# Create a game instance for each session (in a real app, you'd use session management)
game = Hangman()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/new-game', methods=['POST'])
def new_game():
    data = request.get_json()
    difficulty = data.get('difficulty', 'easy')
    game_state = game.reset_game(difficulty)
    return jsonify(game_state)

@app.route('/api/guess', methods=['POST'])
def make_guess():
    data = request.get_json()
    letter = data.get('letter')
    
    if not letter or len(letter) != 1 or not letter.isalpha():
        return jsonify({"error": "Invalid guess"}), 400
    
    game_state = game.guess(letter)
    return jsonify(game_state)

@app.route('/api/game-state', methods=['GET'])
def get_game_state():
    return jsonify(game.get_game_state())

if __name__ == '__main__':
    app.run(debug=True)