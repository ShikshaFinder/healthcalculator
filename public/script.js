document.addEventListener("DOMContentLoaded", () => {
  const bmiForm = document.getElementById("bmiForm");
  const resultDiv = document.getElementById("result");
  const historyBody = document.getElementById("historyBody");

  // Load BMI history
  loadHistory();

  bmiForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const weight = parseFloat(document.getElementById("weight").value);
    const height = parseFloat(document.getElementById("height").value) / 100; // Convert cm to m

    if (isNaN(weight) || isNaN(height)) {
      alert("Please enter valid numbers");
      return;
    }

    const bmi = (weight / (height * height)).toFixed(2);
    const category = getBMICategory(bmi);

    try {
      const response = await fetch("/api/bmi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bmi,
          category,
          weight,
          height: height * 100, // Convert back to cm for storage
        }),
      });

      if (response.ok) {
        resultDiv.innerHTML = `
                    <div class="alert alert-success">
                        <h4>Your BMI: ${bmi}</h4>
                        <p>Category: ${category}</p>
                    </div>
                `;
        loadHistory();
        bmiForm.reset();
      } else {
        throw new Error("Failed to save BMI data");
      }
    } catch (error) {
      resultDiv.innerHTML = `
                <div class="alert alert-danger">
                    Error: ${error.message}
                </div>
            `;
    }
  });

  async function loadHistory() {
    try {
      const response = await fetch("/api/bmi");
      const data = await response.json();

      historyBody.innerHTML = data
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
    } catch (error) {
      console.error("Error loading history:", error);
    }
  }

  function getBMICategory(bmi) {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal weight";
    if (bmi < 30) return "Overweight";
    return "Obese";
  }
});
