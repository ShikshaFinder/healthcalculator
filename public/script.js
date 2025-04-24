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

  medicationForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const medication = {
      name: document.getElementById("medName").value,
      dosage: document.getElementById("medDosage").value,
      frequency: document.getElementById("medFrequency").value,
      time: document.getElementById("medTime").value,
      createdAt: new Date().toISOString(),
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
        const isMissed = medTime < new Date();

        return `
          <div class="medication-item ${isMissed ? "missed" : ""}">
            <h6>${med.name}</h6>
            <p>Dosage: ${med.dosage}</p>
            <p>Time: ${med.time}</p>
            <p>Frequency: ${med.frequency}</p>
            ${isMissed ? '<span class="badge bg-warning">Missed</span>' : ""}
          </div>
        `;
      })
      .join("");
  }
}

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
  });

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
