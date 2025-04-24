document.addEventListener("DOMContentLoaded", () => {
  const bmiForm = document.getElementById("bmiForm");
  const resultDiv = document.getElementById("result");
  const historyBody = document.getElementById("historyBody");

  // Load BMI history
  loadHistory();

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

    loadHistory();
    bmiForm.reset();
  });

  function loadHistory() {
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
});
