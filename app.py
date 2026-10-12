from flask import Flask, request, jsonify
from flask_cors import CORS

import pandas as pd
import joblib
import json
import os
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    confusion_matrix,
    accuracy_score,
    precision_score,
    recall_score,
    f1_score
)


# ============================================================
# FLASK APPLICATION
# ============================================================

app = Flask(__name__)

CORS(app)


# ============================================================
# FILE PATHS
# ============================================================

MODEL_PATH = "traffic_model.joblib"
METRICS_PATH = "model_metrics.json"
DATA_PATH = "traffic.csv"


# ============================================================
# LOAD MODEL
# ============================================================

model = None

if os.path.exists(MODEL_PATH):

    model = joblib.load(
        MODEL_PATH
    )


# ============================================================
# LOAD MODEL METRICS
# ============================================================

metrics = None

if os.path.exists(METRICS_PATH):

    with open(
        METRICS_PATH,
        "r"
    ) as file:

        metrics = json.load(file)


# ============================================================
# LOAD REAL DATASET
# ============================================================

traffic_data = None

if os.path.exists(DATA_PATH):

    traffic_data = pd.read_csv(
        DATA_PATH
    )


# ============================================================
# PREDICTION HISTORY
# ============================================================

prediction_history = []


# ============================================================
# HOME API
# ============================================================

@app.route("/")
def home():

    return jsonify({

        "service":
        "AI-Based Traffic Volume Prediction API",

        "status":
        "running",

        "message":
        "Flask API is working successfully."

    })


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route(
    "/api/health",
    methods=["GET"]
)
def health():

    selected_model = None

    if metrics:

        selected_model = metrics.get(
            "selected_model"
        )


    records_count = 0

    if traffic_data is not None:

        records_count = len(
            traffic_data
        )


    return jsonify({

        "status":
        "healthy",

        "service":
        "AI-Based Traffic Volume Prediction API",

        "model_loaded":
        model is not None,

        "selected_model":
        selected_model,

        "records_count":
        records_count

    })


# ============================================================
# TRAFFIC VOLUME PREDICTION
# ============================================================

@app.route(
    "/api/predict",
    methods=["POST"]
)
def predict():

    try:

        # Check model
        if model is None:

            return jsonify({

                "error":
                "Trained model is not available."

            }), 500


        # Get JSON
        data = request.get_json()


        if not data:

            return jsonify({

                "error":
                "Request body must contain JSON data."

            }), 400


        # Required fields
        required_fields = [

            "junction",
            "hour",
            "day_of_week",
            "month",
            "day"

        ]


        missing_fields = [

            field

            for field in required_fields

            if field not in data

        ]


        if missing_fields:

            return jsonify({

                "error":
                "Missing required fields: "
                + ", ".join(
                    missing_fields
                )

            }), 400


        # Convert values
        junction = int(
            data["junction"]
        )

        hour = int(
            data["hour"]
        )

        day_of_week = int(
            data["day_of_week"]
        )

        month = int(
            data["month"]
        )

        day = int(
            data["day"]
        )


        # ====================================================
        # VALIDATION
        # ====================================================

        if junction < 1:

            return jsonify({

                "error":
                "Junction must be a positive integer."

            }), 400


        if hour < 0 or hour > 23:

            return jsonify({

                "error":
                "Hour must be an integer between 0 and 23."

            }), 400


        if day_of_week < 0 or day_of_week > 6:

            return jsonify({

                "error":
                "Day of week must be between 0 and 6."

            }), 400


        if month < 1 or month > 12:

            return jsonify({

                "error":
                "Month must be between 1 and 12."

            }), 400


        if day < 1 or day > 31:

            return jsonify({

                "error":
                "Day must be between 1 and 31."

            }), 400


        # ====================================================
        # CREATE MODEL INPUT
        # ====================================================

        input_data = pd.DataFrame([{

            "Junction":
            junction,

            "hour":
            hour,

            "day_of_week":
            day_of_week,

            "month":
            month,

            "day":
            day

        }])


        # ====================================================
        # MAKE PREDICTION
        # ====================================================

        prediction = model.predict(
            input_data
        )


        predicted_vehicles = int(
            round(
                float(
                    prediction[0]
                )
            )
        )


        # ====================================================
        # SAVE HISTORY
        # ====================================================

        history_item = {

            "id":
            len(prediction_history) + 1,

            "junction":
            junction,

            "hour":
            hour,

            "day_of_week":
            day_of_week,

            "month":
            month,

            "day":
            day,

            "predicted_vehicles":
            predicted_vehicles,

            "timestamp":
            datetime.now().strftime(
                "%Y-%m-%d %H:%M:%S"
            )

        }


        prediction_history.append(
            history_item
        )


        # ====================================================
        # RESPONSE
        # ====================================================

        return jsonify({

            "message":
            "Traffic volume prediction completed successfully.",

            "predicted_vehicles":
            predicted_vehicles,

            "inputs": {

                "junction":
                junction,

                "hour":
                hour,

                "day_of_week":
                day_of_week,

                "month":
                month,

                "day":
                day

            },

            "date":
            datetime.now().strftime(
                "%Y-%m-%d"
            ),

            "time":
            datetime.now().strftime(
                "%H:%M:%S"
            ),

            "id":
            junction

        })


    except ValueError as error:

        return jsonify({

            "error":
            f"Invalid input value: {str(error)}"

        }), 400


    except Exception as error:

        return jsonify({

            "error":
            str(error)

        }), 500


# ============================================================
# MODEL PERFORMANCE
# ============================================================

@app.route(
    "/api/model-performance",
    methods=["GET"]
)
def model_performance():

    if metrics is None:

        return jsonify({

            "error":
            "Model metrics are not available."

        }), 500


    return jsonify(
        metrics
    )


# ============================================================
# DATASET STATISTICS
# ============================================================

@app.route(
    "/api/statistics",
    methods=["GET"]
)
def statistics():

    if traffic_data is None:

        return jsonify({

            "error":
            "Traffic dataset is not available."

        }), 500


    data = traffic_data.copy()


    data["DateTime"] = pd.to_datetime(
        data["DateTime"]
    )


    data["hour"] = data[
        "DateTime"
    ].dt.hour


    # Junction statistics
    junction_statistics = []


    for junction, group in data.groupby(
        "Junction"
    ):

        junction_statistics.append({

            "junction":
            int(junction),

            "average_vehicles":
            round(
                float(
                    group["Vehicles"].mean()
                ),
                2
            ),

            "total_records":
            int(len(group))

        })


    # Hourly statistics
    hourly_statistics = []


    for hour, group in data.groupby(
        "hour"
    ):

        hourly_statistics.append({

            "hour":
            int(hour),

            "average_vehicles":
            round(
                float(
                    group["Vehicles"].mean()
                ),
                2
            )

        })


    return jsonify({

        "total_records":
        int(len(data)),

        "junction_count":
        int(
            data["Junction"].nunique()
        ),

        "junction_statistics":
        junction_statistics,

        "hourly_statistics":
        hourly_statistics

    })


# ============================================================
# GET PREDICTION HISTORY
# ============================================================

@app.route(
    "/api/prediction-history",
    methods=["GET"]
)
def get_prediction_history():

    return jsonify(
        prediction_history
    )


# ============================================================
# DELETE PREDICTION HISTORY
# ============================================================

@app.route(
    "/api/prediction-history",
    methods=["DELETE"]
)
def delete_prediction_history():

    prediction_history.clear()


    return jsonify({

        "message":
        "Prediction history cleared successfully."

    })
# ============================================================
# CONFUSION MATRIX
# ============================================================

@app.route("/api/confusion-matrix", methods=["GET"])
def get_confusion_matrix():

    try:

        # Check trained model
        if model is None:
            return jsonify({
                "error": "Trained model is not available."
            }), 500

        # Check dataset
        if traffic_data is None:
            return jsonify({
                "error": "Traffic dataset is not available."
            }), 500

        # ----------------------------------------------------
        # Prepare dataset
        # ----------------------------------------------------

        data = traffic_data.copy()

        # Convert DateTime
        data["DateTime"] = pd.to_datetime(
            data["DateTime"]
        )

        # Create the same features used during training
        data["hour"] = data["DateTime"].dt.hour
        data["day_of_week"] = data["DateTime"].dt.dayofweek
        data["month"] = data["DateTime"].dt.month
        data["day"] = data["DateTime"].dt.day

        # Same features used by the trained model
        features = [
            "Junction",
            "hour",
            "day_of_week",
            "month",
            "day"
        ]

        X = data[features]
        y = data["Vehicles"]

        # ----------------------------------------------------
        # Same 80/20 test split used during model training
        # ----------------------------------------------------

        X_train, X_test, y_train, y_test = train_test_split(
            X,
            y,
            test_size=0.2,
            random_state=42
        )

        # ----------------------------------------------------
        # Predict traffic volume
        # ----------------------------------------------------

        y_pred = model.predict(X_test)

        # ----------------------------------------------------
        # Convert vehicle volume into traffic categories
        # ----------------------------------------------------

        def traffic_category(value):

            if value <= 20:
                return "Low"

            elif value <= 40:
                return "Medium"

            else:
                return "High"

        actual_categories = [
            traffic_category(value)
            for value in y_test
        ]

        predicted_categories = [
            traffic_category(value)
            for value in y_pred
        ]

        labels = [
            "Low",
            "Medium",
            "High"
        ]

        # ----------------------------------------------------
        # Confusion Matrix
        # ----------------------------------------------------

        cm = confusion_matrix(
            actual_categories,
            predicted_categories,
            labels=labels
        )

        # ----------------------------------------------------
        # Classification Metrics
        # ----------------------------------------------------

        accuracy = accuracy_score(
            actual_categories,
            predicted_categories
        )

        precision = precision_score(
            actual_categories,
            predicted_categories,
            labels=labels,
            average="weighted",
            zero_division=0
        )

        recall = recall_score(
            actual_categories,
            predicted_categories,
            labels=labels,
            average="weighted",
            zero_division=0
        )

        f1 = f1_score(
            actual_categories,
            predicted_categories,
            labels=labels,
            average="weighted",
            zero_division=0
        )

        # ----------------------------------------------------
        # Return JSON
        # ----------------------------------------------------

        return jsonify({

            "title": "Traffic Volume Classification Confusion Matrix",

            "model": metrics.get(
                "selected_model",
                "Random Forest Regressor"
            ),

            "dataset": "traffic.csv",

            "test_records": int(len(y_test)),

            "classification_method": {
                "Low": "0-20 vehicles",
                "Medium": "21-40 vehicles",
                "High": "41+ vehicles"
            },

            "labels": labels,

            "confusion_matrix": cm.tolist(),

            "metrics": {
                "accuracy": round(
                    float(accuracy), 4
                ),

                "precision": round(
                    float(precision), 4
                ),

                "recall": round(
                    float(recall), 4
                ),

                "f1_score": round(
                    float(f1), 4
                )
            }

        }), 200

    except Exception as e:

        return jsonify({
            "error": f"Failed generating confusion matrix: {str(e)}"
        }), 500


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    app.run(

        host="127.0.0.1",

        port=3000,

        debug=True

    )