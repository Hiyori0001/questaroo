export interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

export const allTriviaQuestions: Question[] = [
  {
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    correctAnswer: "Paris",
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    correctAnswer: "Mars",
  },
  {
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: "4",
  },
  {
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    correctAnswer: "Pacific",
  },
  {
    question: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"],
    correctAnswer: "Leonardo da Vinci",
  },
  {
    question: "What is the smallest country in the world?",
    options: ["Monaco", "Vatican City", "Nauru", "San Marino"],
    correctAnswer: "Vatican City",
  },
  {
    question: "Which element has the chemical symbol 'O'?",
    options: ["Osmium", "Oxygen", "Gold", "Oganesson"],
    correctAnswer: "Oxygen",
  },
  {
    question: "How many continents are there?",
    options: ["5", "6", "7", "8"],
    correctAnswer: "7",
  },
  {
    question: "What is the highest mountain in Africa?",
    options: ["Mount Everest", "Mount Kilimanjaro", "Mount Fuji", "Mount Blanc"],
    correctAnswer: "Mount Kilimanjaro",
  },
  {
    question: "Which animal is known as the 'King of the Jungle'?",
    options: ["Tiger", "Lion", "Elephant", "Bear"],
    correctAnswer: "Lion",
  },
  {
    question: "What is the chemical symbol for water?",
    options: ["O2", "H2O", "CO2", "NaCl"],
    correctAnswer: "H2O",
  },
  {
    question: "What is the capital of Japan?",
    options: ["Beijing", "Seoul", "Tokyo", "Bangkok"],
    correctAnswer: "Tokyo",
  },
  {
    question: "Which gas do plants absorb from the atmosphere?",
    options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
    correctAnswer: "Carbon Dioxide",
  },
  {
    question: "What is the largest mammal in the world?",
    options: ["Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
    correctAnswer: "Blue Whale",
  },
  {
    question: "How many sides does a triangle have?",
    options: ["2", "3", "4", "5"],
    correctAnswer: "3",
  },
  {
    question: "Which country is famous for the Great Wall?",
    options: ["India", "China", "Japan", "Egypt"],
    correctAnswer: "China",
  },
  {
    question: "What is the main ingredient in guacamole?",
    options: ["Tomato", "Onion", "Avocado", "Chili"],
    correctAnswer: "Avocado",
  },
  {
    question: "What is the currency of the United States?",
    options: ["Euro", "Yen", "Dollar", "Pound"],
    correctAnswer: "Dollar",
  },
  {
    question: "Which famous scientist developed the theory of relativity?",
    options: ["Isaac Newton", "Galileo Galilei", "Albert Einstein", "Stephen Hawking"],
    correctAnswer: "Albert Einstein",
  },
  {
    question: "What is the highest number on a standard roulette wheel?",
    options: ["32", "36", "38", "40"],
    correctAnswer: "36",
  },
];