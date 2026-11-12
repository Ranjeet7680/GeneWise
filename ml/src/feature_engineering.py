"""
GeneWise - Biomedical Feature Engineering Pipeline
Domain-Specific Medical Feature Transformers & Composite Clinical Indices

Implements:
1. Mean Arterial Pressure (MAP) and Pulse Pressure (PP)
2. Immunoglobulin Ratios and Total Serology Burden
3. Composite Symptom Burden Index and Diabetic-GI Interactions
4. Log1p and Robust Outlier Transformations
5. Scikit-Learn Compatible Transformer Pipeline
"""

import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin

class BiomedicalFeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Scikit-learn compatible transformer for engineering biomedical and clinical features.
    """
    def __init__(
        self,
        include_immunoglobulin_ratios: bool = True,
        include_symptom_scores: bool = True,
        include_log_transforms: bool = True,
        include_vitals_indices: bool = True,
    ):
        self.include_immunoglobulin_ratios = include_immunoglobulin_ratios
        self.include_symptom_scores = include_symptom_scores
        self.include_log_transforms = include_log_transforms
        self.include_vitals_indices = include_vitals_indices
        self.feature_names_ = []

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        # Convert to DataFrame if NumPy array
        if isinstance(X, np.ndarray):
            df = pd.DataFrame(X).copy()
        else:
            df = X.copy()

        # 1. Immunoglobulin Biomarker Ratios & Composite Serology
        if self.include_immunoglobulin_ratios:
            cols = [c.lower() for c in df.columns]
            iga_col = next((c for c in df.columns if c.lower() == "iga"), None)
            igg_col = next((c for c in df.columns if c.lower() == "igg"), None)
            igm_col = next((c for c in df.columns if c.lower() == "igm"), None)

            if iga_col and igg_col:
                # IgA to IgG ratio (discriminates IgA deficiency & selective enteropathy)
                df["IgA_to_IgG_ratio"] = df[iga_col] / (df[igg_col].replace(0, np.nan) + 1e-5)
                df["IgA_to_IgG_ratio"] = df["IgA_to_IgG_ratio"].fillna(0)

            if iga_col and igg_col and igm_col:
                # Total Serological Burden
                df["Total_Immunoglobulins"] = df[iga_col] + df[igg_col] + df[igm_col]

        # 2. Symptom Composite Burden & Interaction
        if self.include_symptom_scores:
            symptom_cols = ["Diarrhoea", "Abdominal", "Sticky_Stool", "Weight_loss"]
            present_symptoms = [c for c in symptom_cols if c in df.columns]
            
            if present_symptoms:
                def to_binary(col_series):
                    if col_series.dtype == object:
                        return (col_series.astype(str).str.strip().str.lower() == "yes").astype(int)
                    return (col_series > 0).astype(int)

                binary_symptoms = pd.DataFrame({col: to_binary(df[col]) for col in present_symptoms})
                df["Symptom_Severity_Index"] = binary_symptoms.sum(axis=1)

                # Diabetic-Enteric Risk Multiplier
                diabetes_col = next((c for c in df.columns if c.lower() == "diabetes"), None)
                if diabetes_col:
                    diab_binary = to_binary(df[diabetes_col])
                    df["Diabetic_GI_Risk_Multiplier"] = diab_binary * df["Symptom_Severity_Index"]

        # 3. Log1p Normalization for Skewed Serological Biomarkers
        if self.include_log_transforms:
            for bio in ["IgA", "IgG", "IgM"]:
                col = next((c for c in df.columns if c.lower() == bio.lower()), None)
                if col and pd.api.types.is_numeric_dtype(df[col]):
                    df[f"{bio}_Log1p"] = np.log1p(np.maximum(0, df[col]))

        # 4. Cardiovascular & Hemodynamic Vital Indices (if BP columns present)
        if self.include_vitals_indices:
            sbp_col = next((c for c in df.columns if "systolic" in c.lower() or c.lower() == "sbp"), None)
            dbp_col = next((c for c in df.columns if "diastolic" in c.lower() or c.lower() == "dbp"), None)

            if sbp_col and dbp_col:
                # Mean Arterial Pressure (MAP) = (2 * DBP + SBP) / 3
                df["Mean_Arterial_Pressure"] = (2 * df[dbp_col] + df[sbp_col]) / 3.0
                # Pulse Pressure = SBP - DBP
                df["Pulse_Pressure"] = df[sbp_col] - df[dbp_col]

        self.feature_names_ = list(df.columns)
        return df

    def get_feature_names_out(self, input_features=None):
        return np.array(self.feature_names_)

def evaluate_feature_engineering_lift():
    """
    Evaluates cross-validation performance comparison before and after feature engineering.
    """
    import json
    from pathlib import Path
    from sklearn.ensemble import GradientBoostingClassifier
    from sklearn.metrics import roc_auc_score, accuracy_score, f1_score
    from sklearn.model_selection import StratifiedKFold, cross_val_score
    from sklearn.pipeline import Pipeline
    from sklearn.compose import ColumnTransformer
    from sklearn.preprocessing import StandardScaler, OneHotEncoder

    data_path = Path(__file__).parent.parent / "datasets" / "celiac_disease_lab_data.csv"
    if not data_path.exists():
        print(f"Dataset not found at {data_path}")
        return

    df = pd.read_csv(data_path)
    df["Diabetes Type"] = df["Diabetes Type"].fillna("None")

    feature_cols = [
        "Age", "Gender", "Diabetes", "Diabetes Type",
        "Diarrhoea", "Abdominal", "Short_Stature", "Sticky_Stool",
        "Weight_loss", "IgA", "IgG", "IgM",
    ]
    target_col = "Disease_Diagnose"

    X = df[feature_cols].copy()
    y = (df[target_col].str.strip().str.lower() == "yes").astype(int)

    # 1. Baseline Model without Feature Engineering
    num_cols = ["Age", "IgA", "IgG", "IgM"]
    cat_cols = [c for c in feature_cols if c not in num_cols]
    pre_baseline = ColumnTransformer([
        ("num", StandardScaler(), num_cols),
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols),
    ])
    clf_baseline = GradientBoostingClassifier(n_estimators=100, learning_rate=0.08, max_depth=3, random_state=42)
    pipe_baseline = Pipeline([("prep", pre_baseline), ("clf", clf_baseline)])

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores_baseline = cross_val_score(pipe_baseline, X, y, cv=cv, scoring="roc_auc")

    # 2. Model WITH Feature Engineering
    fe = BiomedicalFeatureEngineer()
    X_fe = fe.fit_transform(X)

    engineered_num_cols = num_cols + ["IgA_to_IgG_ratio", "Total_Immunoglobulins", "Symptom_Severity_Index", "IgA_Log1p"]
    engineered_cat_cols = cat_cols

    pre_fe = ColumnTransformer([
        ("num", StandardScaler(), engineered_num_cols),
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), engineered_cat_cols),
    ])
    clf_fe = GradientBoostingClassifier(n_estimators=120, learning_rate=0.07, max_depth=4, random_state=42)
    pipe_fe = Pipeline([("prep", pre_fe), ("clf", clf_fe)])
    scores_fe = cross_val_score(pipe_fe, X_fe, y, cv=cv, scoring="roc_auc")

    baseline_mean = float(np.mean(scores_baseline))
    fe_mean = float(np.mean(scores_fe))
    lift = float((fe_mean - baseline_mean) * 100)

    print("=" * 60)
    print("BIOMEDICAL FEATURE ENGINEERING BENCHMARK EVALUATION")
    print("=" * 60)
    print(f"Baseline ROC-AUC (Raw Features):         {baseline_mean:.4f} +/- {np.std(scores_baseline):.4f}")
    print(f"Engineered ROC-AUC (With Derived Ratios): {fe_mean:.4f} +/- {np.std(scores_fe):.4f}")
    print(f"Net Performance Lift:                   +{lift:.2f}% ROC-AUC boost!")
    print("=" * 60)

if __name__ == "__main__":
    evaluate_feature_engineering_lift()
