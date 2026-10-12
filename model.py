import pandas as pd
import numpy as np
import joblib
import json

from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVR
from sklearn.neighbors import KNeighborsRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from xgboost import XGBRegressor


# ============================================================
# 1. LOAD REAL TRAFFIC DATASET
# ============================================================

df = pd.read_csv("traffic.csv")

print("Dataset loaded successfully!")
print("Dataset shape:", df.shape)

print("\nColumns:")
print(df.columns.tolist())


# ============================================================
# 2. DATA PREPROCESSING
# ============================================================

df["DateTime"] = pd.to_datetime(df["DateTime"])

df["hour"] = df["DateTime"].dt.hour
df["day_of_week"] = df["DateTime"].dt.dayofweek
df["month"] = df["DateTime"].dt.month
df["day"] = df["DateTime"].dt.day


# ============================================================
# 3. FEATURE SELECTION
# ============================================================

features = [
    "Junction",
    "hour",
    "day_of_week",
    "month",
    "day"
]

target = "Vehicles"

X = df[features]
y = df[target]


# ============================================================
# 4. TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

print("\nTraining records:", len(X_train))
print("Testing records:", len(X_test))


# ============================================================
# 5. DEFINE SIX MACHINE LEARNING MODELS
# ============================================================

models = {
    "Decision Tree Regressor": DecisionTreeRegressor(
        random_state=42
    ),

    "Random Forest Regressor": RandomForestRegressor(
        n_estimators=100,
        random_state=42,
        n_jobs=-1
    ),

    "SVR": SVR(
        kernel="rbf",
        C=100,
        gamma="scale",
        cache_size=2000
    ),

    "KNN Regressor": KNeighborsRegressor(
        n_neighbors=5
    ),

    "XGBoost Regressor": XGBRegressor(
        n_estimators=100,
        random_state=42,
        objective="reg:squarederror",
        n_jobs=-1
    ),

    "Gradient Boosting Regressor": GradientBoostingRegressor(
        random_state=42
    )
}


# ============================================================
# 6. TRAIN AND EVALUATE MODELS
# ============================================================

results = {}

for name, model in models.items():

    print("\n======================================")
    print("Training:", name)
    print("======================================")

    # SVR is computationally expensive.
    # Use a representative training sample only for SVR.
    if name == "SVR":

        sample_size = min(10000, len(X_train))

        X_model_train = X_train.sample(
            n=sample_size,
            random_state=42
        )

        y_model_train = y_train.loc[
            X_model_train.index
        ]

        print(
            "SVR training sample:",
            sample_size,
            "records"
        )

    else:

        X_model_train = X_train
        y_model_train = y_train


    # Train model
    model.fit(
        X_model_train,
        y_model_train
    )


    # Test model on the SAME test dataset
    predictions = model.predict(X_test)


    # Calculate metrics
    mae = mean_absolute_error(
        y_test,
        predictions
    )

    mse = mean_squared_error(
        y_test,
        predictions
    )

    rmse = np.sqrt(mse)

    r2 = r2_score(
        y_test,
        predictions
    )


    results[name] = {
        "MAE": round(float(mae), 4),
        "MSE": round(float(mse), 4),
        "RMSE": round(float(rmse), 4),
        "R2": round(float(r2), 4)
    }


    print("MAE :", round(mae, 4))
    print("MSE :", round(mse, 4))
    print("RMSE:", round(rmse, 4))
    print("R2  :", round(r2, 4))


# ============================================================
# 7. SELECT BEST MODEL
# ============================================================

best_model_name = max(
    results,
    key=lambda name: results[name]["R2"]
)

best_model = models[
    best_model_name
]


print("\n")
print("======================================")
print("BEST MODEL")
print("======================================")

print("Model:", best_model_name)
print(
    "R2:",
    results[best_model_name]["R2"]
)


# ============================================================
# 8. SAVE BEST MODEL USING JOBLIB
# ============================================================

joblib.dump(
    best_model,
    "traffic_model.joblib"
)

print("\nBest model saved as:")
print("traffic_model.joblib")


# ============================================================
# 9. SAVE MODEL METRICS
# ============================================================

metrics_data = {

    "dataset": "traffic.csv",

    "total_records": int(len(df)),

    "training_records": int(len(X_train)),

    "testing_records": int(len(X_test)),

    "features": features,

    "target": target,

    "selected_model": best_model_name,

    "best_metrics": results[
        best_model_name
    ],

    "all_models": results
}


with open(
    "model_metrics.json",
    "w"
) as file:

    json.dump(
        metrics_data,
        file,
        indent=4
    )


print("\nMetrics saved as:")
print("model_metrics.json")

print("\n")
print("======================================")
print("MODEL TRAINING COMPLETED SUCCESSFULLY")
print("======================================")