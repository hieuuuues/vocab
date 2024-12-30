let learnedVocab = JSON.parse(localStorage.getItem("learnedVocab")) || [];
let currentIndex = 0;
let progressChart;
const synth = window.speechSynthesis;

document.getElementById(
  "learned-count"
).textContent = `${learnedVocab.length} từ`;

function playAudio(word) {
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  synth.speak(utterance);
}

function playCurrentAudio() {
  const currentWord = learnedVocab[currentIndex].word;
  playAudio(currentWord);
}

function addVocabulary() {
  const vocabInput = document.getElementById("vocab-input");
  const meaningInput = document.getElementById("meaning-input");
  const newWord = vocabInput.value.trim();
  const meaning = meaningInput.value.trim();

  if (newWord && meaning) {
    learnedVocab.push({
      word: newWord,
      meaning: meaning,
    });
    updateVocabularyList();
    vocabInput.value = "";
    meaningInput.value = "";
  }
}

function updateVocabularyList() {
  document.getElementById(
    "learned-count"
  ).textContent = `${learnedVocab.length} từ`;
  localStorage.setItem("learnedVocab", JSON.stringify(learnedVocab));

  if (document.getElementById("stats-page").style.display === "block") {
    showStatistics();
  }
}

function openFlashcard() {
  if (learnedVocab.length > 0) {
    currentIndex = 0;
    document.getElementById("main-page").style.display = "none";
    document.getElementById("flashcard-page").style.display = "block";
    showFlashcard();
  }
}

function showFlashcard() {
  if (learnedVocab.length > 0 && currentIndex < learnedVocab.length) {
    const currentVocab = learnedVocab[currentIndex];
    document.getElementById("vocab-word").textContent = currentVocab.word;
    document.getElementById("vocab-meaning").textContent = currentVocab.meaning;

    const flashcard = document.getElementById("flashcard");
    flashcard.classList.add("show-front");
    flashcard.classList.remove("show-back");

    flashcard.onclick = () => {
      flashcard.classList.toggle("show-front");
      flashcard.classList.toggle("show-back");
    };
  }
}

function nextFlashcard() {
  if (currentIndex < learnedVocab.length - 1) {
    currentIndex++;
    showFlashcard();
  } else {
    alert("Đã hết flashcard.");
  }
}

function prevFlashcard() {
  if (currentIndex > 0) {
    currentIndex--;
    showFlashcard();
  } else {
    alert("Đây là thẻ đầu tiên.");
  }
}

function startMatching() {
  document.getElementById("main-page").style.display = "none";
  document.getElementById("matching-page").style.display = "block";
  generateMatchingGame();
}

function generateMatchingGame() {
  const matchingContainer = document.getElementById("matching-container");
  matchingContainer.innerHTML = "";

  const allWords = [...learnedVocab];
  const shuffled = allWords.sort(() => Math.random() - 0.5);
  const words = shuffled.map((item) => ({ type: "word", text: item.word }));
  const meanings = shuffled.map((item) => ({
    type: "meaning",
    text: item.meaning,
  }));

  const items = [...words, ...meanings].sort(() => Math.random() - 0.5);
  const selectedItems = [];

  items.forEach((item) => {
    const div = document.createElement("div");
    div.className = "matching-item";
    div.textContent = item.text;
    div.dataset.type = item.type;
    div.dataset.text = item.text;

    div.addEventListener("click", () => {
      if (selectedItems.length < 2 && !div.classList.contains("selected")) {
        div.classList.add("selected");
        selectedItems.push(div);

        if (item.type === "word") {
          playAudio(item.text);
        }

        if (selectedItems.length === 2) {
          checkMatch(selectedItems);
        }
      }
    });

    matchingContainer.appendChild(div);
  });
}

function checkMatch(selectedItems) {
  const [first, second] = selectedItems;
  const firstText = first.dataset.text;
  const secondText = second.dataset.text;

  let match = false;
  for (const vocab of learnedVocab) {
    if (
      (firstText === vocab.word && secondText === vocab.meaning) ||
      (firstText === vocab.meaning && secondText === vocab.word)
    ) {
      match = true;
      break;
    }
  }

  if (match) {
    first.style.backgroundColor = "#4caf50";
    second.style.backgroundColor = "#4caf50";
    setTimeout(() => {
      first.style.visibility = "hidden";
      second.style.visibility = "hidden";
    }, 1000);
  } else {
    first.style.backgroundColor = "#ff5733";
    second.style.backgroundColor = "#ff5733";
    setTimeout(() => {
      first.classList.remove("selected");
      second.classList.remove("selected");
      first.style.backgroundColor = "#e0e0e0";
      second.style.backgroundColor = "#e0e0e0";
    }, 1000);
  }

  setTimeout(() => {
    selectedItems.length = 0;
  }, 1000);
}

function startScramblePractice() {
  document.getElementById("main-page").style.display = "none";
  document.getElementById("learned-scramble-page").style.display = "block";
  generateLearnedScrambledWords();
}

function generateLearnedScrambledWords() {
  const container = document.getElementById("scrambled-words-container");
  container.innerHTML = "";

  if (learnedVocab.length > 0) {
    const shuffledLearnedVocab = [...learnedVocab].sort(
      () => Math.random() - 0.5
    );

    shuffledLearnedVocab.forEach((vocab, index) => {
      const scrambledWord = scrambleWord(vocab.word);
      const wordContainer = document.createElement("div");
      wordContainer.className = "scramble-item";

      const wordDiv = document.createElement("div");
      wordDiv.textContent = `Từ xáo trộn: ${scrambledWord}`;
      wordContainer.appendChild(wordDiv);

      const meaningDiv = document.createElement("div");
      meaningDiv.textContent = `Nghĩa: ${vocab.meaning}`;
      wordContainer.appendChild(meaningDiv);

      const input = document.createElement("input");
      input.type = "text";
      input.id = `unscrambled-input-${index}`;
      input.dataset.originalWord = vocab.word;
      input.placeholder = "Nhập từ gốc...";
      wordContainer.appendChild(input);

      const audioButton = document.createElement("button");
      audioButton.textContent = "🔊";
      audioButton.onclick = () => playAudio(vocab.word);
      wordContainer.appendChild(audioButton);

      container.appendChild(wordContainer);
    });
  }
}

function scrambleWord(word) {
  const wordArray = word.split("");
  for (let i = wordArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wordArray[i], wordArray[j]] = [wordArray[j], wordArray[i]];
  }
  return wordArray.join("");
}

function checkAllUnscrambledWords() {
  const resultDiv = document.getElementById("scramble-result");
  resultDiv.innerHTML = "";

  learnedVocab.forEach((vocab, index) => {
    const input = document.getElementById(`unscrambled-input-${index}`);
    const userWord = input.value.trim().toLowerCase();
    const correctWord = vocab.word.toLowerCase();

    if (userWord === correctWord) {
      const correctDiv = document.createElement("div");
      correctDiv.textContent = `Từ "${vocab.word}" nhập đúng!`;
      correctDiv.style.color = "green";
      resultDiv.appendChild(correctDiv);
    } else {
      const wrongDiv = document.createElement("div");
      wrongDiv.textContent = `Từ "${vocab.word}" nhập sai!`;
      wrongDiv.style.color = "red";
      resultDiv.appendChild(wrongDiv);
    }
  });
}

function resetApplication() {
  if (confirm("Bạn có chắc muốn đặt lại toàn bộ dữ liệu không?")) {
    learnedVocab = [];
    updateVocabularyList();
    alert("Dữ liệu đã được đặt lại!");
  }
}

function showStatistics() {
  document.getElementById("main-page").style.display = "none";
  document.getElementById("stats-page").style.display = "block";

  const ctx = document.getElementById("progressChart").getContext("2d");
  const data = {
    labels: ["Số từ đã học"],
    datasets: [
      {
        label: "Tiến độ học tập",
        data: [learnedVocab.length],
        backgroundColor: ["#4caf50"],
        hoverOffset: 4,
      },
    ],
  };

  if (progressChart) {
    progressChart.destroy();
  }

  progressChart = new Chart(ctx, {
    type: "pie",
    data: data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${context.raw} từ`,
          },
        },
      },
    },
  });
}

function goBack() {
  document.getElementById("main-page").style.display = "block";
  document.getElementById("flashcard-page").style.display = "none";
  document.getElementById("matching-page").style.display = "none";
  document.getElementById("stats-page").style.display = "none";
  document.getElementById("learned-scramble-page").style.display = "none";
}
