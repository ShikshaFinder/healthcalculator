document.addEventListener("DOMContentLoaded", () => {
  loadProfile();
  loadMedicalHistory();
  loadHealthStatistics();
});

function loadProfile() {
  const profile = JSON.parse(localStorage.getItem("profile") || "{}");
  const personalInfo = document.getElementById("personalInfo");

  if (Object.keys(profile).length === 0) {
    personalInfo.innerHTML =
      '<p class="text-muted">No profile information available</p>';
    return;
  }

  personalInfo.innerHTML = `
        <div class="profile-details">
            <p><strong>Name:</strong> ${profile.name || "Not set"}</p>
            <p><strong>Age:</strong> ${profile.age || "Not set"}</p>
            <p><strong>Gender:</strong> ${profile.gender || "Not set"}</p>
            <p><strong>Contact:</strong> ${profile.contact || "Not set"}</p>
        </div>
    `;
}

function loadMedicalHistory() {
  const medicalHistory = JSON.parse(
    localStorage.getItem("medicalHistory") || "{}"
  );
  const medicalHistoryDiv = document.getElementById("medicalHistory");

  if (Object.keys(medicalHistory).length === 0) {
    medicalHistoryDiv.innerHTML =
      '<p class="text-muted">No medical history available</p>';
    return;
  }

  medicalHistoryDiv.innerHTML = `
        <div class="medical-details">
            <h6>Allergies</h6>
            <p>${medicalHistory.allergies || "None recorded"}</p>
            <h6>Chronic Conditions</h6>
            <p>${medicalHistory.conditions || "None recorded"}</p>
        </div>
    `;
}

function loadHealthStatistics() {
  // Load BMI History
  const bmiHistory = JSON.parse(localStorage.getItem("bmiHistory") || "[]");
  const bmiTableBody = document.querySelector("#bmiStats tbody");
  bmiTableBody.innerHTML = bmiHistory
    .slice(0, 5) // Show last 5 entries
    .map(
      (record) => `
            <tr>
                <td>${new Date(record.createdAt).toLocaleDateString()}</td>
                <td>${record.bmi}</td>
                <td>${record.category}</td>
            </tr>
        `
    )
    .join("");

  // Load Medication Statistics
  const medications = JSON.parse(localStorage.getItem("medications") || "[]");
  const totalMeds = medications.length;
  const missedDoses = medications.reduce(
    (sum, med) => sum + (med.missedDoses || 0),
    0
  );
  const complianceRate =
    totalMeds > 0
      ? Math.round(((totalMeds - missedDoses) / totalMeds) * 100)
      : 0;

  document.getElementById("totalMeds").textContent = totalMeds;
  document.getElementById("missedDoses").textContent = missedDoses;
  document.getElementById("complianceRate").textContent = `${complianceRate}%`;

  // Load Water Intake Statistics
  const waterIntake = JSON.parse(localStorage.getItem("waterIntake") || "{}");
  const today = new Date().toDateString();
  const todayWater = waterIntake[today] || 0;

  // Calculate weekly average
  const last7Days = Object.entries(waterIntake)
    .filter(([date]) => {
      const entryDate = new Date(date);
      const today = new Date();
      return today - entryDate <= 7 * 24 * 60 * 60 * 1000;
    })
    .map(([_, amount]) => amount);

  const weeklyAverage =
    last7Days.length > 0
      ? Math.round(last7Days.reduce((a, b) => a + b, 0) / last7Days.length)
      : 0;

  document.getElementById("todayWater").textContent = todayWater;
  document.getElementById("weeklyWater").textContent = weeklyAverage;

  const waterProgress = document.getElementById("waterProgress");
  const percentage = Math.min((todayWater / 2000) * 100, 100);
  waterProgress.style.width = `${percentage}%`;
  waterProgress.textContent = `${todayWater}ml / 2000ml`;
}

function editProfile() {
  const profile = JSON.parse(localStorage.getItem("profile") || "{}");
  const modal = new bootstrap.Modal(document.getElementById("profileModal"));

  // Fill form with existing data
  document.getElementById("name").value = profile.name || "";
  document.getElementById("age").value = profile.age || "";
  document.getElementById("gender").value = profile.gender || "male";
  document.getElementById("contact").value = profile.contact || "";

  modal.show();
}

function editMedicalHistory() {
  const medicalHistory = JSON.parse(
    localStorage.getItem("medicalHistory") || "{}"
  );
  const modal = new bootstrap.Modal(
    document.getElementById("medicalHistoryModal")
  );

  // Fill form with existing data
  document.getElementById("allergies").value = medicalHistory.allergies || "";
  document.getElementById("conditions").value = medicalHistory.conditions || "";

  modal.show();
}

function saveProfile() {
  const profile = {
    name: document.getElementById("name").value,
    age: document.getElementById("age").value,
    gender: document.getElementById("gender").value,
    contact: document.getElementById("contact").value,
  };

  localStorage.setItem("profile", JSON.stringify(profile));
  bootstrap.Modal.getInstance(document.getElementById("profileModal")).hide();
  loadProfile();
}

function saveMedicalHistory() {
  const medicalHistory = {
    allergies: document.getElementById("allergies").value,
    conditions: document.getElementById("conditions").value,
  };

  localStorage.setItem("medicalHistory", JSON.stringify(medicalHistory));
  bootstrap.Modal.getInstance(
    document.getElementById("medicalHistoryModal")
  ).hide();
  loadMedicalHistory();
}
