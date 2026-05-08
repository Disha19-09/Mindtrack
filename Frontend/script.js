let selectedMood = "";

function selectMood(mood, event) {
  selectedMood = mood;

  document.querySelectorAll(".moods button").forEach(btn => {
    btn.classList.remove("active-mood");
  });

  event.target.classList.add("active-mood");

  document.getElementById("message").innerText = "Selected: " + mood;
}
function saveMood() {
  if (selectedMood === "") {
    alert("Please select a mood!");
    return;
  }

  const note = document.getElementById("note").value;

  fetch("https://mindtrack-9n7p.onrender.com/mood", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": localStorage.getItem("token")
    },
    body: JSON.stringify({
      mood: selectedMood,
      note: note || "No note"
    })
  })
  .then(res => res.text())
  .then(data => {

    document.getElementById("message").innerText = data;
    const feedback = getFeedback(selectedMood, note);
    document.getElementById("feedback").innerText = feedback;

    document.getElementById("note").value = "";

    loadMoods();
    suggestMusic(selectedMood);
    suggestExercise(selectedMood);
  })
  .catch(err => {
    console.log(err);
    document.getElementById("message").innerText = "Something went wrong!";
  });
}

function loadMoods() {
    fetch("https://mindtrack-9n7p.onrender.com/moods", {
      headers: {
        "Authorization": localStorage.getItem("token")
      }
    })
    .then(res => res.json())
    .then(data => {
      const historyDiv = document.getElementById("history");
      historyDiv.innerHTML = "";

      data.forEach(entry => {
        const p = document.createElement("p");

        const noteText = entry.note?.trim() || "No note";
        const date = new Date(entry.date).toLocaleDateString();

        p.innerText = `Mood: ${entry.mood} | Note: ${noteText} | Date: ${date}`;
        historyDiv.appendChild(p);
      });

      const streak = calculateStreak(data);
      document.getElementById("streak").innerText = `Current streak: ${streak} days`;

      showWeeklyInsights(data);
      showInsights(data);
      showChart(data);
      updateStats(data);
    })
    .catch(err => console.log(err));
}

window.onload = loadMoods;

function getFeedback(mood, note) {
  note = note.toLowerCase();

  if (mood === "happy") {
    return "Great to see you happy! Keep doing what you love 😊";
  }

  if (mood === "neutral") {
    return "Hope your day gets even better 🙂";
  }

  if (mood === "stressed") {
    if (note.includes("exam")) {
      return "Exams can be stressful. Try short breaks and plan your study 📚";
    }
    return "Take a deep breath and relax 🧘";
  }

  if (mood === "low") {
    return "It's okay to feel low. Talk to someone or take care 💙";
  }

  return "Take care 💙";
}

function showInsights(data) {
  const insightsDiv = document.getElementById("insights");

  if (data.length === 0) {
    insightsDiv.innerText = "No data yet";
    return;
  }

  let count = { happy: 0, neutral: 0, stressed: 0, low: 0 };

  data.forEach(entry => {
    count[entry.mood]++;
  });

  let maxMood = "";
  let maxCount = 0;

  for (let mood in count) {
    if (count[mood] > maxCount) {
      maxCount = count[mood];
      maxMood = mood;
    }
  }

  insightsDiv.innerHTML = `
    <p>Most frequent mood: ${maxMood}</p>
    <p>Happy: ${count.happy}</p>
    <p>Neutral: ${count.neutral}</p>
    <p>Stressed: ${count.stressed}</p>
    <p>Low: ${count.low}</p>
  `;
}

function calculateStreak(data) {
  if (data.length === 0) return 0;

  const days = [...new Set(data.map(entry =>
    new Date(entry.date).toLocaleDateString()
  ))];

  days.sort((a, b) => new Date(b) - new Date(a));

  let streak = 1;

  for (let i = 0; i < days.length - 1; i++) {
    const diff = (new Date(days[i]) - new Date(days[i + 1])) / (1000 * 60 * 60 * 24);
    if (Math.round(diff) === 1) streak++;
    else break;
  }

  return streak;
}

function showWeeklyInsights(data) {
  const weeklyDiv = document.getElementById("weekly");

  if (data.length === 0) {
    weeklyDiv.innerText = "No data this week";
    return;
  }

  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);

  const weeklyData = data.filter(entry =>
    new Date(entry.date) >= last7Days
  );

  if (weeklyData.length === 0) {
    weeklyDiv.innerText = "No entries this week";
    return;
  }

  let count = { happy: 0, neutral: 0, stressed: 0, low: 0 };

  weeklyData.forEach(entry => {
    count[entry.mood]++;
  });

  weeklyDiv.innerHTML = `
    <p>This Week:</p>
    <p>😊 Happy: ${count.happy}</p>
    <p>😐 Neutral: ${count.neutral}</p>
    <p>😣 Stressed: ${count.stressed}</p>
    <p>😔 Low: ${count.low}</p>
  `;

  if (count.stressed > count.happy) {
    weeklyDiv.innerHTML += "<p>Try to relax more this week 💙</p>";
  }
}
function updateStats(data) {

  document.getElementById("checkins").innerText =
    data.length;

  let count = {
    happy: 0,
    neutral: 0,
    stressed: 0,
    low: 0
  };

  data.forEach(entry => {
    count[entry.mood]++;
  });

  let topMood = "None";
  let max = 0;

  for (let mood in count) {
    if (count[mood] > max) {
      max = count[mood];
      topMood = mood;
    }
  }

  document.getElementById("topMood").innerText =
    topMood;

  document.getElementById("happyDays").innerText =
    count.happy;

  const streak = calculateStreak(data);

  document.getElementById("streakCount").innerText =
    streak;
}
function showChart(data) {
  const ctx = document.getElementById("moodChart").getContext("2d");

  let count = { happy: 0, neutral: 0, stressed: 0, low: 0 };

  data.forEach(entry => {
    count[entry.mood]++;
  });

  if (window.chart) {
    window.chart.destroy();
  }

  window.chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Happy", "Neutral", "Stressed", "Low"],
      datasets: [{
        label: "Mood Count",
        data: [count.happy, count.neutral, count.stressed, count.low],
        backgroundColor: ["#ddb6fd", "#e4a0f1", "#d064fa", "#9C27B0"],
        borderRadius: 12,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}
function suggestMusic(mood) {
  const musicList = document.getElementById("musicList");

  const songs = {
    happy: [
      { name: "Happy Vibes 🎉", link: "https://www.youtube.com/embed/pYCgJ_98Flk?si=NDISk1ytHdtTWPIl" },
      { name: "Energy Boost ⚡", link: "https://www.youtube.com/embed/XzhQ-FefINM?si=JN5XOMvu6QkH7saB"}
    ],
    neutral: [
      { name: "Chill Beats 😌", link: "https://www.youtube.com/embed/pIvf9bOPXIw?si=7fR7gy7p5Ib0ES7Y" }
    ],
    stressed: [
      { name: "Calm Mind 🧘", link: "https://www.youtube.com/embed/USvJyWFl5B8?si=6QL2hm5k-Q6SMmeM" }
    ],
    low: [
      { name: "Soft Comfort 💙", link: "https://www.youtube.com/embed/rwn0Zs7ELzc?si=ZdrXyQOrOpv_Bkx9"  }
    ]
  };

  const selectedSongs = songs[mood];

  musicList.innerHTML = selectedSongs.map(song => `
    <div class="song">
      <span>${song.name}</span>
      <a href="${song.link}" target="_blank">▶</a>
    </div>
  `).join("");
}
function suggestExercise(mood) {
  const exercise = document.getElementById("exerciseText");

  if (mood === "happy") {
    exercise.innerText = "Keep the energy high! Maybe a light workout 💪";
  } 
  else if (mood === "neutral") {
    exercise.innerText = "Try a short walk or stretch 🚶‍♀️";
  } 
  else if (mood === "stressed") {
    exercise.innerText = "Do deep breathing for 5 minutes 🧘";
  } 
  else if (mood === "low") {
    exercise.innerText = "Go outside, get fresh air 🌿";
  }
}
function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}