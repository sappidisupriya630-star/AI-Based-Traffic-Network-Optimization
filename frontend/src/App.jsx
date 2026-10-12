import { useEffect, useState } from "react";
import "./App.css";

function App() {
  // ============================================================
  // BASIC STATES
  // ============================================================

  const [activePage, setActivePage] = useState("Dashboard");

  const [formData, setFormData] = useState({
    junction: 1,
    hour: 18,
    day_of_week: 1,
    month: 7,
    day: 15,
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  // ============================================================
  // PREDICTION HISTORY
  // ============================================================

  const [predictionHistory, setPredictionHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // ============================================================
  // CONFUSION MATRIX
  // ============================================================

  const [confusionData, setConfusionData] = useState(null);
  const [loadingConfusion, setLoadingConfusion] = useState(false);

  // ============================================================
  // FETCH PREDICTION HISTORY
  // ============================================================

  const fetchPredictionHistory = async () => {
    try {
      setLoadingHistory(true);

      const response = await fetch(
        "http://127.0.0.1:3000/api/prediction-history"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Unable to load prediction history");
      }

      setPredictionHistory(data);
    } catch (error) {
      console.error("History error:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // ============================================================
  // FETCH CONFUSION MATRIX
  // ============================================================

  const fetchConfusionMatrix = async () => {
    try {
      setLoadingConfusion(true);

      const response = await fetch(
        "http://127.0.0.1:3000/api/confusion-matrix"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to load confusion matrix"
        );
      }

      setConfusionData(data);
    } catch (error) {
      console.error("Confusion matrix error:", error);

      alert(
        "Unable to load confusion matrix.\nMake sure Flask is running."
      );
    } finally {
      setLoadingConfusion(false);
    }
  };

  // ============================================================
  // LOAD HISTORY WHEN FRONTEND STARTS
  // ============================================================

  useEffect(() => {
    fetchPredictionHistory();
  }, []);

  // ============================================================
  // PREDICT TRAFFIC
  // ============================================================

  const predictTraffic = async () => {
    setLoading(true);
    setPrediction(null);

    try {
      const response = await fetch(
        "http://127.0.0.1:3000/api/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            junction: Number(formData.junction),
            hour: Number(formData.hour),
            day_of_week: Number(formData.day_of_week),
            month: Number(formData.month),
            day: Number(formData.day),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Prediction failed");
      }

      // Show prediction result
      setPrediction(data);

      // Refresh prediction history
      await fetchPredictionHistory();
    } catch (error) {
      console.error("Prediction error:", error);

      alert(
        "Unable to connect to Flask API.\nMake sure app.py is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // DASHBOARD
  // ============================================================

  const renderDashboard = () => (
    <>
      <header className="top-header">
        <div className="header-left">
          <div className="engine-pill">
            ⚙️ &nbsp; ML Regression Engine
          </div>

          <span className="model-text">
            Random Forest Regressor (R² = 0.8684)
          </span>

          <h1>Overview Dashboard</h1>

          <p>
            Urban traffic volume indicators, Kaggle dataset distribution,
            and regression model metrics
          </p>
        </div>

        <div className="header-right">
          <div className="api-online">
            <span></span>
            Flask API Online
          </div>

          <button
            className="refresh-button"
            onClick={() => window.location.reload()}
          >
            ⟳ &nbsp; Refresh
          </button>
        </div>
      </header>

      <div className="dashboard-body">
        {/* HERO */}

        <section className="hero-card">
          <div className="system-pill">
            ✨ &nbsp; Machine Learning Regression System
          </div>

          <h2>
            AI-Based Traffic Volume Prediction System
          </h2>

          <p className="hero-description">
            Trained on <strong>48,120</strong> real-world records from
            the Kaggle Traffic dataset across{" "}
            <strong>4 urban junctions</strong>.
            <br />
            Leverages a high-performance{" "}
            <strong>Random Forest Regressor</strong>{" "}
            (R² = 0.8684) to forecast exact vehicle volumes from
            temporal and junction parameters.
          </p>

          <div className="hero-buttons">
            <button
              className="primary-button"
              onClick={() =>
                setActivePage("Volume Prediction")
              }
            >
              ◔ &nbsp; Predict Traffic Volume
              <span>→</span>
            </button>

            <button
              className="secondary-button"
              onClick={() =>
                setActivePage("Regression Reports")
              }
            >
              ▥ &nbsp; View 6-Model Benchmark
            </button>
          </div>
        </section>

        {/* METRIC CARDS */}

        <section className="metric-cards">
          <div className="metric-card">
            <div className="metric-top">
              <div>
                <span>TOTAL DATASET RECORDS</span>
                <strong>48,120</strong>
              </div>

              <div className="metric-icon">
                🚗
              </div>
            </div>

            <p>Real traffic observations</p>
          </div>

          <div className="metric-card">
            <div className="metric-top">
              <div>
                <span>MEAN TRAFFIC VOLUME</span>
                <strong className="blue-number">
                  22.8
                </strong>
              </div>

              <div className="metric-icon">
                ↗
              </div>
            </div>

            <p>Average vehicles across dataset</p>
          </div>

          <div className="metric-card">
            <div className="metric-top">
              <div>
                <span>URBAN JUNCTIONS</span>
                <strong>4</strong>
              </div>

              <div className="metric-icon">
                ◉
              </div>
            </div>

            <p>Traffic monitoring locations</p>
          </div>

          <div className="metric-card">
            <div className="metric-top">
              <div>
                <span>BEST MODEL R²</span>
                <strong className="purple-number">
                  0.8684
                </strong>
              </div>

              <div className="metric-icon">
                ✦
              </div>
            </div>

            <p>Random Forest Regressor</p>
          </div>
        </section>

        {/* LOWER SECTION */}

        <section className="lower-grid">
          <div className="panel">
            <div className="panel-heading">
              <div>
                <h3>Selected Model</h3>
                <p>Best performing regression algorithm</p>
              </div>

              <span className="best-badge">
                BEST MODEL
              </span>
            </div>

            <div className="model-box">
              <div className="model-main-icon">
                🌲
              </div>

              <div>
                <h4>Random Forest Regressor</h4>

                <p>
                  Ensemble learning model selected using
                  highest test-set R².
                </p>
              </div>
            </div>

            <div className="model-stats">
              <div>
                <span>MAE</span>
                <strong>4.6639</strong>
              </div>

              <div>
                <span>MSE</span>
                <strong>53.6261</strong>
              </div>

              <div>
                <span>RMSE</span>
                <strong>7.3230</strong>
              </div>

              <div>
                <span>R²</span>
                <strong>0.8684</strong>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-heading">
              <div>
                <h3>Dataset Information</h3>
                <p>Real-world traffic dataset</p>
              </div>
            </div>

            <div className="dataset-list">
              <div>
                <span>Dataset</span>
                <strong>Kaggle Traffic Prediction</strong>
              </div>

              <div>
                <span>Training Records</span>
                <strong>38,496</strong>
              </div>

              <div>
                <span>Testing Records</span>
                <strong>9,624</strong>
              </div>

              <div>
                <span>Target Variable</span>
                <strong>Vehicles</strong>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );

  // ============================================================
  // TRAFFIC VOLUME PREDICTION
  // ============================================================

  const renderPrediction = () => (
    <>
      <header className="top-header simple-header">
        <div>
          <div className="engine-pill">
            ⚙️ &nbsp; ML Regression Engine
          </div>

          <h1>Traffic Volume Prediction</h1>

          <p>
            Predict vehicle volume using the trained Random Forest
            Regressor.
          </p>
        </div>

        <div className="api-online">
          <span></span>
          Flask API Online
        </div>
      </header>

      <div className="dashboard-body">
        <section className="prediction-panel">
          <h2>Traffic Volume Prediction</h2>

          <p>
            Enter the five features required by the trained model.
          </p>

          <div className="form-grid">
            {/* JUNCTION */}

            <label>
              Junction

              <select
                value={formData.junction}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    junction: Number(e.target.value),
                  })
                }
              >
                <option value="1">
                  Junction 1
                </option>

                <option value="2">
                  Junction 2
                </option>

                <option value="3">
                  Junction 3
                </option>

                <option value="4">
                  Junction 4
                </option>
              </select>
            </label>

            {/* HOUR */}

            <label>
              Hour (0–23)

              <input
                type="number"
                min="0"
                max="23"
                value={formData.hour}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    hour: Number(e.target.value),
                  })
                }
              />
            </label>

            {/* DAY OF WEEK */}

            <label>
              Day of Week (0–6)

              <input
                type="number"
                min="0"
                max="6"
                value={formData.day_of_week}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    day_of_week: Number(e.target.value),
                  })
                }
              />
            </label>

            {/* MONTH */}

            <label>
              Month (1–12)

              <input
                type="number"
                min="1"
                max="12"
                value={formData.month}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    month: Number(e.target.value),
                  })
                }
              />
            </label>

            {/* DAY */}

            <label>
              Day (1–31)

              <input
                type="number"
                min="1"
                max="31"
                value={formData.day}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    day: Number(e.target.value),
                  })
                }
              />
            </label>
          </div>

          {/* PREDICT BUTTON */}

          <button
            className="predict-large-button"
            onClick={predictTraffic}
            disabled={loading}
          >
            {loading
              ? "Running Prediction..."
              : "⚡ Predict Traffic Volume"}
          </button>

          {/* RESULT */}

          {prediction && (
            <div className="prediction-result-box">
              <span>
                PREDICTED VEHICLE VOLUME
              </span>

              <strong>
                {prediction.predicted_vehicles}
              </strong>

              <p>vehicles</p>

              <div className="prediction-details">
                <span>
                  Junction {prediction.inputs?.junction}
                </span>

                <span>
                  Hour {prediction.inputs?.hour}:00
                </span>

                <span>
                  Random Forest
                </span>
              </div>

              <small>
                ✓ Prediction successfully saved to history
              </small>
            </div>
          )}
        </section>
      </div>
    </>
  );

  // ============================================================
  // REGRESSION REPORTS
  // ============================================================

  const renderReports = () => (
    <>
      <header className="top-header simple-header">
        <div>
          <div className="engine-pill">
            ▥ &nbsp; MODEL EVALUATION
          </div>

          <h1>
            6-Model Regression Benchmark
          </h1>

          <p>
            Performance comparison using the real traffic dataset.
          </p>
        </div>
      </header>

      <div className="dashboard-body">
        <section className="report-panel">
          <div className="report-title">
            <h2>
              Regression Model Performance
            </h2>

            <span>
              Higher R² and lower error are better
            </span>
          </div>

          <div className="report-table">
            <div className="report-row report-head">
              <span>MODEL</span>
              <span>MAE</span>
              <span>MSE</span>
              <span>RMSE</span>
              <span>R²</span>
            </div>

            {[
              [
                "Decision Tree Regressor",
                "5.5047",
                "89.7680",
                "9.4746",
                "0.7797",
              ],

              [
                "Random Forest Regressor",
                "4.6639",
                "53.6261",
                "7.3230",
                "0.8684",
              ],

              [
                "SVR",
                "8.6537",
                "190.8686",
                "13.8155",
                "0.5317",
              ],

              [
                "KNN Regressor",
                "8.3742",
                "144.1999",
                "12.0083",
                "0.6462",
              ],

              [
                "XGBoost Regressor",
                "4.8578",
                "56.4205",
                "7.5114",
                "0.8616",
              ],

              [
                "Gradient Boosting Regressor",
                "7.3789",
                "116.4468",
                "10.7911",
                "0.7143",
              ],
            ].map((row, index) => (
              <div
                className={
                  index === 1
                    ? "report-row best-row"
                    : "report-row"
                }
                key={row[0]}
              >
                <span>{row[0]}</span>
                <span>{row[1]}</span>
                <span>{row[2]}</span>
                <span>{row[3]}</span>
                <strong>{row[4]}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );

  // ============================================================
  // CONFUSION MATRIX
  // ============================================================

  const renderConfusionMatrix = () => (
    <>
      <header className="top-header simple-header">
        <div>
          <div className="engine-pill">
            ▦ &nbsp; CLASSIFICATION ANALYSIS
          </div>

          <h1>
            Traffic Volume Confusion Matrix
          </h1>

          <p>
            Supplementary classification analysis using Low,
            Medium and High traffic levels.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchConfusionMatrix}
          disabled={loadingConfusion}
        >
          ⟳ &nbsp;
          {loadingConfusion
            ? "Loading..."
            : "Refresh"}
        </button>
      </header>

      <div className="dashboard-body">
        {!confusionData ? (
          <section className="prediction-panel">
            <h2>
              Confusion Matrix Analysis
            </h2>

            <p>
              The trained model is a regression model, so the
              confusion matrix is used as a supplementary
              traffic-level classification analysis.
            </p>

            <button
              className="predict-large-button"
              onClick={fetchConfusionMatrix}
              disabled={loadingConfusion}
            >
              {loadingConfusion
                ? "Generating Matrix..."
                : "Generate Confusion Matrix"}
            </button>
          </section>
        ) : (
          <>
            {/* TRAFFIC LEVEL CARDS */}

            <section className="metric-cards">
              <div className="metric-card">
                <div className="metric-top">
                  <div>
                    <span>LOW TRAFFIC</span>

                    <strong>
                      0–20
                    </strong>
                  </div>

                  <div className="metric-icon">
                    🟢
                  </div>
                </div>

                <p>Vehicles</p>
              </div>

              <div className="metric-card">
                <div className="metric-top">
                  <div>
                    <span>MEDIUM TRAFFIC</span>

                    <strong>
                      21–40
                    </strong>
                  </div>

                  <div className="metric-icon">
                    🟡
                  </div>
                </div>

                <p>Vehicles</p>
              </div>

              <div className="metric-card">
                <div className="metric-top">
                  <div>
                    <span>HIGH TRAFFIC</span>

                    <strong>
                      41+
                    </strong>
                  </div>

                  <div className="metric-icon">
                    🔴
                  </div>
                </div>

                <p>Vehicles</p>
              </div>
            </section>

            {/* CONFUSION MATRIX TABLE */}

            <section className="report-panel">
              <div className="report-title">
                <div>
                  <h2>
                    Confusion Matrix
                  </h2>

                  <p>
                    Actual traffic level vs predicted traffic level
                  </p>
                </div>

                <span className="best-badge">
                  {confusionData.model}
                </span>
              </div>

              <div className="confusion-wrapper">
                <table className="confusion-table">
                  <thead>
                    <tr>
                      <th>
                        Actual \ Predicted
                      </th>

                      {confusionData.labels?.map(
                        (label) => (
                          <th key={label}>
                            {label}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {confusionData.confusion_matrix?.map(
                      (row, rowIndex) => (
                        <tr key={rowIndex}>
                          <th>
                            {confusionData.labels?.[
                              rowIndex
                            ]}
                          </th>

                          {row.map(
                            (value, colIndex) => (
                              <td
                                key={colIndex}
                                className={
                                  rowIndex === colIndex
                                    ? "matrix-correct"
                                    : "matrix-wrong"
                                }
                              >
                                {value}
                              </td>
                            )
                          )}
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* CLASSIFICATION METRICS */}

            <section className="metric-cards">
              <div className="metric-card">
                <div className="metric-top">
                  <div>
                    <span>ACCURACY</span>

                    <strong>
                      {(
                        confusionData.metrics
                          ?.accuracy * 100
                      ).toFixed(2)}
                      %
                    </strong>
                  </div>

                  <div className="metric-icon">
                    ✓
                  </div>
                </div>

                <p>
                  Overall classification accuracy
                </p>
              </div>

              <div className="metric-card">
                <div className="metric-top">
                  <div>
                    <span>PRECISION</span>

                    <strong>
                      {(
                        confusionData.metrics
                          ?.precision * 100
                      ).toFixed(2)}
                      %
                    </strong>
                  </div>

                  <div className="metric-icon">
                    ◎
                  </div>
                </div>

                <p>
                  Weighted precision
                </p>
              </div>

              <div className="metric-card">
                <div className="metric-top">
                  <div>
                    <span>RECALL</span>

                    <strong>
                      {(
                        confusionData.metrics
                          ?.recall * 100
                      ).toFixed(2)}
                      %
                    </strong>
                  </div>

                  <div className="metric-icon">
                    ↗
                  </div>
                </div>

                <p>
                  Weighted recall
                </p>
              </div>

              <div className="metric-card">
                <div className="metric-top">
                  <div>
                    <span>F1 SCORE</span>

                    <strong>
                      {(
                        confusionData.metrics
                          ?.f1_score * 100
                      ).toFixed(2)}
                      %
                    </strong>
                  </div>

                  <div className="metric-icon">
                    ✦
                  </div>
                </div>

                <p>
                  Weighted F1 score
                </p>
              </div>
            </section>

            {/* INFORMATION */}

            <section className="about-panel">
              <h2>
                Classification Method
              </h2>

              <p>
                The original model predicts continuous vehicle
                volume. For this supplementary analysis, actual
                and predicted vehicle counts are converted into
                three traffic levels.
              </p>

              <div className="tech-grid">
                <div>
                  Low: 0–20 vehicles
                </div>

                <div>
                  Medium: 21–40 vehicles
                </div>

                <div>
                  High: 41+ vehicles
                </div>

                <div>
                  Test Records:{" "}
                  {confusionData.test_records}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );

  // ============================================================
  // ABOUT PROJECT
  // ============================================================

  const renderAbout = () => (
    <>
      <header className="top-header simple-header">
        <div>
          <div className="engine-pill">
            ⓘ &nbsp; PROJECT INFORMATION
          </div>

          <h1>
            About Project
          </h1>

          <p>
            AI-Based Traffic Network Optimization Using Machine
            Learning
          </p>
        </div>
      </header>

      <div className="dashboard-body">
        <section className="about-panel">
          <h2>
            AI-Based Traffic Network Optimization
          </h2>

          <p>
            This project uses a real-world traffic dataset and
            machine learning regression algorithms to predict
            vehicle volume at different urban junctions.
          </p>

          <h3>
            Technology Stack
          </h3>

          <div className="tech-grid">
            <div>Python</div>
            <div>Pandas</div>
            <div>Scikit-learn</div>
            <div>XGBoost</div>
            <div>Flask</div>
            <div>React</div>
            <div>Vite</div>
            <div>Joblib</div>
          </div>
        </section>
      </div>
    </>
  );

  // ============================================================
  // PREDICTION HISTORY
  // ============================================================

  const renderHistory = () => (
    <>
      <header className="top-header simple-header">
        <div>
          <div className="engine-pill">
            ◷ &nbsp; PREDICTION HISTORY
          </div>

          <h1>
            Prediction History
          </h1>

          <p>
            Previous traffic volume predictions generated by
            the ML model.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchPredictionHistory}
          disabled={loadingHistory}
        >
          ⟳ &nbsp;
          {loadingHistory
            ? "Refreshing..."
            : "Refresh"}
        </button>
      </header>

      <div className="dashboard-body">
        {/* SUMMARY CARDS */}

        <section className="history-summary">
          <div className="history-summary-card">
            <span>
              TOTAL PREDICTIONS
            </span>

            <strong>
              {predictionHistory.length}
            </strong>
          </div>

          <div className="history-summary-card">
            <span>
              ML MODEL
            </span>

            <strong>
              Random Forest
            </strong>
          </div>

          <div className="history-summary-card">
            <span>
              DATASET RECORDS
            </span>

            <strong>
              48,120
            </strong>
          </div>
        </section>

        {/* HISTORY PANEL */}

        <section className="history-panel">
          <div className="history-panel-header">
            <div>
              <h2>
                Recent Traffic Predictions
              </h2>

              <p>
                All predictions generated from the Traffic
                Volume Prediction page.
              </p>
            </div>

            <span className="history-status">
              ● Live History
            </span>
          </div>

          {loadingHistory ? (
            <div className="history-empty">
              <div className="loading-spinner"></div>

              <h3>
                Loading prediction history...
              </h3>
            </div>
          ) : predictionHistory.length === 0 ? (
            <div className="history-empty">
              <div className="empty-icon">
                📊
              </div>

              <h3>
                No Predictions Yet
              </h3>

              <p>
                Run a traffic prediction to see it appear here.
              </p>

              <button
                className="primary-button"
                onClick={() =>
                  setActivePage("Volume Prediction")
                }
              >
                ⚡ Make Prediction
              </button>
            </div>
          ) : (
            <div className="history-table-wrapper">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>#</th>

                    <th>
                      Date & Time
                    </th>

                    <th>
                      Junction
                    </th>

                    <th>
                      Hour
                    </th>

                    <th>
                      Day
                    </th>

                    <th>
                      Month
                    </th>

                    <th>
                      Day of Week
                    </th>

                    <th>
                      Predicted Vehicles
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {predictionHistory.map(
                    (item, index) => (
                      <tr
                        key={
                          item.id || index
                        }
                      >
                        <td>
                          <span className="history-number">
                            {index + 1}
                          </span>
                        </td>

                        <td>
                          {item.timestamp || "—"}
                        </td>

                        <td>
                          <span className="junction-badge">
                            Junction {item.junction}
                          </span>
                        </td>

                        <td>
                          {item.hour}:00
                        </td>

                        <td>
                          {item.day}
                        </td>

                        <td>
                          {item.month}
                        </td>

                        <td>
                          {item.day_of_week}
                        </td>

                        <td>
                          <span className="vehicle-result">
                            {item.predicted_vehicles}
                          </span>

                          <small className="vehicle-label">
                            {" "}vehicles
                          </small>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );

  // ============================================================
  // MAIN RETURN
  // ============================================================

  return (
    <div className="app">

      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">
            🚗
          </div>

          <div>
            <div className="brand-small">
              TRAFFIC AI
            </div>

            <div className="brand-name">
              Traffic System
            </div>
          </div>
        </div>

        <nav>
          {[
            ["Dashboard", "▦"],
            ["Volume Prediction", "◔"],
            ["Prediction History", "◷"],
            ["Regression Reports", "▥"],
            ["Confusion Matrix", "▤"],
            ["About Project", "ⓘ"],
          ].map(([name, icon]) => (
            <button
              key={name}
              className={
                activePage === name
                  ? "nav-button active"
                  : "nav-button"
              }
              onClick={() =>
                setActivePage(name)
              }
            >
              <span>
                {icon}
              </span>

              {name}

              {name === "Volume Prediction" && (
                <small>
                  Live
                </small>
              )}
            </button>
          ))}
        </nav>

        {/* MODEL STATUS */}

        <div className="sidebar-model">
          <h3>
            🛡 ML Model Status
          </h3>

          <p>
            Random Forest Regressor loaded from
          </p>

          <code>
            traffic_model.joblib
          </code>

          <div>
            <span>
              ⚡ Inference: Ready
            </span>

            <strong>
              Ready
            </strong>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}

      <main className="main">
        {activePage === "Dashboard" &&
          renderDashboard()}

        {activePage === "Volume Prediction" &&
          renderPrediction()}

        {activePage === "Prediction History" &&
          renderHistory()}

        {activePage === "Regression Reports" &&
          renderReports()}

        {activePage === "Confusion Matrix" &&
          renderConfusionMatrix()}

        {activePage === "About Project" &&
          renderAbout()}
      </main>
    </div>
  );
}

export default App;