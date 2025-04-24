document.addEventListener("DOMContentLoaded", () => {
  // Initialize all sections
  initBMICalculator();
  initMedicationTracker();
  initNutritionTracker();
  initSymptomTracker();
  initProfileManager();
});

// BMI Calculator Section
function initBMICalculator() {
  const bmiForm = document.getElementById("bmiForm");
  const resultDiv = document.getElementById("result");
  const historyBody = document.getElementById("historyBody");

  // Load BMI history
  loadBMIHistory();

  bmiForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const weight = parseFloat(document.getElementById("weight").value);
    const height = parseFloat(document.getElementById("height").value) / 100; // Convert cm to m

    if (isNaN(weight) || isNaN(height)) {
      alert("Please enter valid numbers");
      return;
    }

    const bmi = (weight / (height * height)).toFixed(2);
    const category = getBMICategory(bmi);

    // Save to localStorage
    const bmiRecord = {
      bmi,
      category,
      weight,
      height: height * 100, // Convert back to cm for storage
      createdAt: new Date().toISOString(),
    };

    const history = JSON.parse(localStorage.getItem("bmiHistory") || "[]");
    history.unshift(bmiRecord); // Add new record at the beginning
    localStorage.setItem("bmiHistory", JSON.stringify(history));

    resultDiv.innerHTML = `
      <div class="alert alert-success">
        <h4>Your BMI: ${bmi}</h4>
        <p>Category: ${category}</p>
      </div>
    `;

    loadBMIHistory();
    bmiForm.reset();
  });

  function loadBMIHistory() {
    const history = JSON.parse(localStorage.getItem("bmiHistory") || "[]");

    historyBody.innerHTML = history
      .map(
        (record) => `
          <tr>
            <td>${record.bmi}</td>
            <td>${record.category}</td>
            <td>${record.weight} kg</td>
            <td>${record.height} cm</td>
            <td>${new Date(record.createdAt).toLocaleDateString()}</td>
          </tr>
        `
      )
      .join("");
  }

  function getBMICategory(bmi) {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal weight";
    if (bmi < 30) return "Overweight";
    return "Obese";
  }
}

// Medication Tracker Section
function initMedicationTracker() {
  const medicationForm = document.getElementById("medicationForm");
  const medicationList = document.getElementById("medicationList");

  loadMedications();
  checkMissedDoses();

  // Check for missed doses every minute
  setInterval(checkMissedDoses, 60000);

  medicationForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const medication = {
      name: document.getElementById("medName").value,
      dosage: document.getElementById("medDosage").value,
      frequency: document.getElementById("medFrequency").value,
      time: document.getElementById("medTime").value,
      createdAt: new Date().toISOString(),
      lastTaken: null,
      missedDoses: 0,
    };

    const medications = JSON.parse(localStorage.getItem("medications") || "[]");
    medications.push(medication);
    localStorage.setItem("medications", JSON.stringify(medications));

    loadMedications();
    medicationForm.reset();
  });

  function loadMedications() {
    const medications = JSON.parse(localStorage.getItem("medications") || "[]");
    const today = new Date().toDateString();

    medicationList.innerHTML = medications
      .map((med) => {
        const medTime = new Date(`${today} ${med.time}`);
        const isMissed = medTime < new Date() && !med.lastTaken;
        const isUpcoming = medTime > new Date() && !med.lastTaken;

        return `
          <div class="medication-item ${isMissed ? "missed" : ""} ${
          isUpcoming ? "upcoming" : ""
        }">
            <h6>${med.name}</h6>
            <p>Dosage: ${med.dosage}</p>
            <p>Time: ${med.time}</p>
            <p>Frequency: ${med.frequency}</p>
            ${isMissed ? `<span class="badge bg-warning">Missed</span>` : ""}
            ${isUpcoming ? `<span class="badge bg-info">Upcoming</span>` : ""}
            ${
              med.lastTaken
                ? `<span class="badge bg-success">Taken at ${new Date(
                    med.lastTaken
                  ).toLocaleTimeString()}</span>`
                : ""
            }
            <button class="btn btn-sm btn-success mt-2" onclick="markAsTaken('${
              med.name
            }')">Mark as Taken</button>
          </div>
        `;
      })
      .join("");
  }

  function checkMissedDoses() {
    const medications = JSON.parse(localStorage.getItem("medications") || "[]");
    const today = new Date().toDateString();
    let hasMissedDoses = false;

    medications.forEach((med) => {
      const medTime = new Date(`${today} ${med.time}`);
      if (medTime < new Date() && !med.lastTaken) {
        hasMissedDoses = true;
        med.missedDoses = (med.missedDoses || 0) + 1;
      }
    });

    if (hasMissedDoses) {
      localStorage.setItem("medications", JSON.stringify(medications));
      loadMedications();

      // Show notification
      if (Notification.permission === "granted") {
        new Notification("Medication Reminder", {
          body: "You have missed medication doses. Please check your medication list.",
          icon: "/favicon.ico",
        });
      }
    }
  }
}

// Add this function to the global scope
window.markAsTaken = function (medicationName) {
  const medications = JSON.parse(localStorage.getItem("medications") || "[]");
  const medication = medications.find((m) => m.name === medicationName);

  if (medication) {
    medication.lastTaken = new Date().toISOString();
    localStorage.setItem("medications", JSON.stringify(medications));
    loadMedications();
  }
};

// Request notification permission when the page loads
document.addEventListener("DOMContentLoaded", () => {
  if (
    Notification.permission !== "granted" &&
    Notification.permission !== "denied"
  ) {
    Notification.requestPermission();
  }
});

// Nutrition Tracker Section
function initNutritionTracker() {
  const mealForm = document.getElementById("mealForm");
  const addWaterBtn = document.getElementById("addWater");
  const waterProgress = document.getElementById("waterProgress");

  loadMeals();
  updateWaterProgress();

  mealForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const meal = {
      type: document.getElementById("mealType").value,
      description: document.getElementById("mealDescription").value,
      calories: parseInt(document.getElementById("calories").value),
      createdAt: new Date().toISOString(),
    };

    const meals = JSON.parse(localStorage.getItem("meals") || "[]");
    meals.push(meal);
    localStorage.setItem("meals", JSON.stringify(meals));

    loadMeals();
    mealForm.reset();
  });

  addWaterBtn.addEventListener("click", () => {
    const today = new Date().toDateString();
    const waterIntake = JSON.parse(localStorage.getItem("waterIntake") || "{}");
    const currentIntake = waterIntake[today] || 0;

    waterIntake[today] = currentIntake + 250;
    localStorage.setItem("waterIntake", JSON.stringify(waterIntake));

    updateWaterProgress();
  });

  function loadMeals() {
    const meals = JSON.parse(localStorage.getItem("meals") || "[]");
    const today = new Date().toDateString();
    const todayMeals = meals.filter(
      (meal) => new Date(meal.createdAt).toDateString() === today
    );

    // Calculate total calories for today
    const totalCalories = todayMeals.reduce(
      (sum, meal) => sum + meal.calories,
      0
    );

    // Update the meal list display
    const mealList =
      document.getElementById("mealList") ||
      (() => {
        const list = document.createElement("div");
        list.id = "mealList";
        mealForm.parentNode.appendChild(list);
        return list;
      })();

    mealList.innerHTML = `
      <h6 class="mt-3">Today's Meals (${totalCalories} calories)</h6>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Description</th>
              <th>Calories</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            ${todayMeals
              .map(
                (meal) => `
              <tr>
                <td>${meal.type}</td>
                <td>${meal.description}</td>
                <td>${meal.calories}</td>
                <td>${new Date(meal.createdAt).toLocaleTimeString()}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function updateWaterProgress() {
    const today = new Date().toDateString();
    const waterIntake = JSON.parse(localStorage.getItem("waterIntake") || "{}");
    const currentIntake = waterIntake[today] || 0;
    const goal = 2000; // 2L daily goal

    const percentage = Math.min((currentIntake / goal) * 100, 100);
    waterProgress.style.width = `${percentage}%`;
    waterProgress.textContent = `${currentIntake}ml / ${goal}ml`;
  }
}

// Symptom Tracker Section
function initSymptomTracker() {
  const symptomForm = document.getElementById("symptomForm");
  const emojiRating = document.querySelector(".emoji-rating");
  const symptomChart = document.getElementById("symptomChart");
  let selectedSeverity = 3;

  // Initialize emoji opacity
  emojiRating.querySelectorAll("span").forEach((span) => {
    span.style.opacity = span.dataset.value === "3" ? "1" : "0.5";
  });

  loadSymptoms();
  initChart();

  emojiRating.addEventListener("click", (e) => {
    if (e.target.tagName === "SPAN") {
      selectedSeverity = parseInt(e.target.dataset.value);
      emojiRating.querySelectorAll("span").forEach((span) => {
        span.style.opacity =
          span.dataset.value === e.target.dataset.value ? "1" : "0.5";
      });
    }
  });

  symptomForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const symptom = {
      type: document.getElementById("symptomType").value,
      severity: selectedSeverity,
      createdAt: new Date().toISOString(),
    };

    const symptoms = JSON.parse(localStorage.getItem("symptoms") || "[]");
    symptoms.push(symptom);
    localStorage.setItem("symptoms", JSON.stringify(symptoms));

    loadSymptoms();
    updateChart();
    symptomForm.reset();
  });

  function loadSymptoms() {
    const symptoms = JSON.parse(localStorage.getItem("symptoms") || "[]");
    const today = new Date().toDateString();
    const todaySymptoms = symptoms.filter(
      (symptom) => new Date(symptom.createdAt).toDateString() === today
    );

    const symptomList =
      document.getElementById("symptomList") ||
      (() => {
        const list = document.createElement("div");
        list.id = "symptomList";
        symptomForm.parentNode.appendChild(list);
        return list;
      })();

    symptomList.innerHTML = `
      <h6 class="mt-3">Today's Symptoms</h6>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Symptom</th>
              <th>Severity</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            ${todaySymptoms
              .map(
                (symptom) => `
              <tr>
                <td>${symptom.type}</td>
                <td>${getEmojiForSeverity(symptom.severity)}</td>
                <td>${new Date(symptom.createdAt).toLocaleTimeString()}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function getEmojiForSeverity(severity) {
    const emojis = ["😊", "🙂", "😐", "😕", "😫"];
    return emojis[severity - 1] || "😐";
  }

  function initChart() {
    const ctx = symptomChart.getContext("2d");
    window.symptomChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "Symptom Severity",
            data: [],
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 5,
          },
        },
      },
    });
  }

  function updateChart() {
    const symptoms = JSON.parse(localStorage.getItem("symptoms") || "[]");
    const last7Days = symptoms.slice(-7);

    window.symptomChart.data.labels = last7Days.map((s) =>
      new Date(s.createdAt).toLocaleDateString()
    );
    window.symptomChart.data.datasets[0].data = last7Days.map(
      (s) => s.severity
    );
    window.symptomChart.update();
  }
}

// Profile Manager Section
function initProfileManager() {
  const profileForm = document.getElementById("profileForm");
  const medicalHistoryForm = document.getElementById("medicalHistoryForm");

  loadProfile();
  loadMedicalHistory();

  profileForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const profile = {
      name: document.getElementById("name").value,
      age: document.getElementById("age").value,
      gender: document.getElementById("gender").value,
      contact: document.getElementById("contact").value,
    };

    localStorage.setItem("profile", JSON.stringify(profile));
    alert("Profile updated successfully!");
  });

  medicalHistoryForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const medicalHistory = {
      allergies: document.getElementById("allergies").value,
      conditions: document.getElementById("conditions").value,
    };

    localStorage.setItem("medicalHistory", JSON.stringify(medicalHistory));
    alert("Medical history updated successfully!");
  });

  function loadProfile() {
    const profile = JSON.parse(localStorage.getItem("profile") || "{}");
    if (profile.name) {
      document.getElementById("name").value = profile.name;
      document.getElementById("age").value = profile.age;
      document.getElementById("gender").value = profile.gender;
      document.getElementById("contact").value = profile.contact;
    }
  }

  function loadMedicalHistory() {
    const medicalHistory = JSON.parse(
      localStorage.getItem("medicalHistory") || "{}"
    );
    if (medicalHistory.allergies) {
      document.getElementById("allergies").value = medicalHistory.allergies;
      document.getElementById("conditions").value = medicalHistory.conditions;
    }
  }
}
