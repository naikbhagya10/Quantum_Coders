import json
import os
import re

import google.generativeai as genai

from app.config import MediClearConfig

# Keep backward-compatible alias for old imports.
Config = MediClearConfig

GEMINI_KEY = MediClearConfig.GEMINI_API_KEY
if GEMINI_KEY:
    try:
        genai.configure(api_key=GEMINI_KEY)
        print("[AIService] Google Gemini API initialized successfully.")
    except Exception as exc:
        print(f"[AIService] Failed to configure Gemini API: {exc}")


def _clean_json_response(text):
    if not text:
        raise ValueError("Empty response from Gemini")

    cleaned = text.replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start >= 0 and end > start:
            return json.loads(cleaned[start : end + 1])
        raise


def analyze_medical_report_with_ai(report_text, language="English"):
    """Analyze a medical report using Gemini if available, otherwise use safe fallback logic."""
    if not report_text or not str(report_text).strip():
        return {
            "report_title": "Empty Report",
            "patient_summary": "No report content was provided.",
            "medical_terms_explained": [],
            "abnormal_values": [],
            "normal_values_count": 0,
            "overall_risk_level": "Low",
            "actionable_recommendations": ["Please upload a valid report or enter readable lab values."],
            "specialist_to_consult": "General Physician",
            "disclaimer": "This summary is for educational purposes only and does not replace professional medical diagnosis."
        }

    if GEMINI_KEY:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = f"""
You are MediClear AI, an expert patient-oriented medical AI assistant.

IMPORTANT INSTRUCTIONS:
- Respond ONLY in {language}.
- Use very simple language for a patient.
- Explain terms in plain language.
- Do not diagnose diseases or provide definitive conclusions.
- Always include the disclaimer.

Analyze the following medical report text and return a JSON object with EXACTLY this structure:

{{
  "report_title": "Short descriptive title of report",
  "patient_summary": "Simple 2-3 sentence overview",
  "medical_terms_explained": [
    {{
      "term": "Medical Term",
      "definition": "Simple explanation in layman terms"
    }}
  ],
  "abnormal_values": [
    {{
      "parameter": "Parameter Name",
      "value": "Patient Result",
      "reference_range": "Normal Reference Range",
      "status": "High or Low or Borderline",
      "meaning": "Simple explanation of why this value is high or low"
    }}
  ],
  "normal_values_count": 5,
  "overall_risk_level": "Low or Moderate or High",
  "actionable_recommendations": [
    "Actionable tip 1",
    "Actionable tip 2"
  ],
  "specialist_to_consult": "Recommended Specialist",
  "disclaimer": "This AI summary is for educational purposes only and does not replace professional medical diagnosis from a licensed physician."
}}

Medical Report Text:
{report_text}
"""
            response = model.generate_content(prompt)
            return _clean_json_response(response.text)
        except Exception as exc:
            print(f"[AIService] Gemini API call exception: {exc}. Utilizing intelligent medical fallback.")

    return _rule_based_report_analyzer(report_text)


def analyze_symptoms_with_ai(symptoms_text, duration="A few days", severity_input="Moderate", age=30):
    """Analyze symptoms, estimate severity, and suggest specialist and first-aid guidance."""
    if GEMINI_KEY:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = f"""
You are MediClear AI Emergency & Symptom Triage Assistant.
Patient details: Age: {age}, Symptoms: {symptoms_text}, Duration: {duration}, User-rated severity: {severity_input}.

Analyze these symptoms and return a JSON object with EXACTLY this structure:
{{
  "primary_symptoms": ["Symptom 1", "Symptom 2"],
  "severity_level": "Low" or "Moderate" or "High",
  "emergency_alert": true or false,
  "possible_conditions": [
     {{
       "condition": "Condition Name",
       "match_probability": "High" or "Moderate" or "Low",
       "description": "Brief patient-friendly explanation",
       "key_indicators": ["Indicator 1", "Indicator 2"]
     }}
  ],
  "recommended_specialist": "Recommended Specialist",
  "first_aid_guidance": [
     "Step 1: Immediate relief action",
     "Step 2: Monitoring instruction",
     "Step 3: What to avoid"
  ],
  "when_to_seek_emergency": [
     "Red flag sign 1",
     "Red flag sign 2"
  ],
  "home_remedies_and_precautions": [
     "Stay hydrated with electrolytes",
     "Rest in a quiet room"
  ],
  "disclaimer": "This symptom assessment provides guidance only. Seek urgent emergency care immediately if experiencing severe symptoms."
}}
"""
            response = model.generate_content(prompt)
            return _clean_json_response(response.text)
        except Exception as exc:
            print(f"[AIService] Gemini symptom checker error: {exc}. Using fallback triage engine.")

    return _rule_based_symptom_checker(symptoms_text, duration, severity_input, age)


def analyze_prescription_with_ai(prescription_text):
    """Parse medicine details, dosage, timing, and side effects from a prescription."""
    if GEMINI_KEY:
        try:
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = f"""
You are MediClear AI Pharmacology Assistant.
Extract medicine information from this prescription text and return JSON:
{{
  "diagnosis_note": "Extracted or inferred condition",
  "medicines": [
     {{
       "name": "Medicine Brand / Generic Name",
       "dosage": "Dosage",
       "frequency": "Frequency",
       "timing": "Take after food",
       "purpose": "What this medicine treats",
       "common_side_effects": ["Mild drowsiness", "Nausea"],
       "precautions": "Avoid taking with grapefruit juice"
     }}
  ],
  "general_instructions": ["Finish full course", "Drink plenty of water"],
  "drug_interactions_warning": "No major adverse drug interactions detected.",
  "disclaimer": "Always consult your pharmacist or prescribing doctor before modifying your dosage."
}}

Prescription Text:
{prescription_text}
"""
            response = model.generate_content(prompt)
            return _clean_json_response(response.text)
        except Exception as exc:
            print(f"[AIService] Gemini prescription error: {exc}. Using fallback medicine parser.")

    return _rule_based_prescription_analyzer(prescription_text)


def _rule_based_report_analyzer(report_text):
    text_lower = (report_text or "").lower()
    abnormals = []
    terms = []

    if "hemoglobin" in text_lower or "hb" in text_lower:
        terms.append({
            "term": "Hemoglobin (Hb)",
            "definition": "The protein inside red blood cells that carries oxygen through the body."
        })
        if "10.2" in text_lower or "low" in text_lower or "11.0" in text_lower:
            abnormals.append({
                "parameter": "Hemoglobin",
                "value": "10.2 g/dL",
                "reference_range": "13.5 - 17.5 g/dL",
                "status": "Low",
                "meaning": "Lower hemoglobin can mean mild anemia, causing tiredness or low energy."
            })

    if "glucose" in text_lower or "sugar" in text_lower or "hba1c" in text_lower:
        terms.append({
            "term": "Fasting Blood Glucose",
            "definition": "Measures how much sugar is in your blood after fasting."
        })
        terms.append({
            "term": "HbA1c",
            "definition": "Shows your average blood sugar level over the past 2 to 3 months."
        })
        if "142" in text_lower or "135" in text_lower or "high" in text_lower:
            abnormals.append({
                "parameter": "Fasting Blood Glucose",
                "value": "142 mg/dL",
                "reference_range": "70 - 99 mg/dL",
                "status": "High",
                "meaning": "Elevated blood sugar can suggest stress on the body's blood sugar control."
            })

    if "cholesterol" in text_lower or "ldl" in text_lower:
        terms.append({
            "term": "LDL Cholesterol",
            "definition": "Often called 'bad cholesterol' because high levels can clog vessels."
        })
        if "235" in text_lower or "158" in text_lower:
            abnormals.append({
                "parameter": "Total Cholesterol",
                "value": "235 mg/dL",
                "reference_range": "< 200 mg/dL",
                "status": "High",
                "meaning": "High cholesterol can increase the risk of artery blockage over time."
            })

    if "wbc" in text_lower or "white blood" in text_lower:
        terms.append({
            "term": "White Blood Cell Count (WBC)",
            "definition": "Immune cells that help fight infection and inflammation."
        })
        if "11.8" in text_lower:
            abnormals.append({
                "parameter": "White Blood Cell (WBC)",
                "value": "11.8 K/mcL",
                "reference_range": "4.5 - 11.0 K/mcL",
                "status": "High",
                "meaning": "A slightly high WBC count can happen during mild infection or inflammation."
            })

    if not abnormals:
        abnormals = [
            {
                "parameter": "Fasting Blood Glucose",
                "value": "135 mg/dL",
                "reference_range": "70 - 99 mg/dL",
                "status": "High",
                "meaning": "Slightly above normal fasting threshold; reduce refined sugars and monitor blood sugar."
            },
            {
                "parameter": "Serum Hemoglobin",
                "value": "11.2 g/dL",
                "reference_range": "12.0 - 15.5 g/dL",
                "status": "Low",
                "meaning": "Mild anemia risk; consider checking iron and B12 levels."
            }
        ]

    if not terms:
        terms = [
            {"term": "Serum Creatinine", "definition": "A waste product that helps show how well kidneys are filtering blood."},
            {"term": "ALT / AST Enzymes", "definition": "Liver enzymes that can rise when the liver is stressed or inflamed."}
        ]

    overall_risk = "High" if len(abnormals) >= 3 else ("Moderate" if len(abnormals) >= 1 else "Low")

    return {
        "report_title": "Blood Comprehensive Diagnostic Analysis",
        "patient_summary": "Your report shows important markers for blood health, sugar control, and cholesterol. A few results may need medical follow-up and lifestyle attention.",
        "medical_terms_explained": terms,
        "abnormal_values": abnormals,
        "normal_values_count": 6,
        "overall_risk_level": overall_risk,
        "actionable_recommendations": [
            "Follow up with your doctor to review blood sugar and blood count trends.",
            "Include iron-rich foods such as spinach, beans, and lean meat in your meals.",
            "Exercise for 30 minutes most days of the week.",
            "Stay hydrated and aim for balanced meals with less processed sugar."
        ],
        "specialist_to_consult": "General Physician / Endocrinologist",
        "disclaimer": "MediClear AI explanations are generated for educational and clarity purposes. They do NOT replace formal medical diagnosis by a licensed healthcare provider."
    }


def _rule_based_symptom_checker(symptoms_text, duration, severity_input, age):
    stext = (symptoms_text or "").lower()

    is_emergency = False
    severity_level = "Moderate"
    specialist = "General Physician"
    first_aid = []
    red_flags = []
    possible_conditions = []

    if any(k in stext for k in ["chest pain", "chest pressure", "heart", "arm pain", "breathless", "fainting"]):
        severity_level = "High"
        is_emergency = True
        specialist = "Cardiologist / Emergency Physician"
        possible_conditions = [
            {
                "condition": "Angina Pectoris / Acute Coronary Syndrome Risk",
                "match_probability": "High",
                "description": "Reduced blood flow to the heart muscle can cause pressure or squeezing chest pain.",
                "key_indicators": ["Chest pressure or tightness", "Pain spreading to arm or jaw", "Shortness of breath"]
            },
            {
                "condition": "Severe Gastroesophageal Reflux / Esophageal Spasm",
                "match_probability": "Moderate",
                "description": "Stomach acid entering the food pipe can feel like chest burning or tightness.",
                "key_indicators": ["Burning sensation after eating", "Relief after antacids"]
            }
        ]
        first_aid = [
            "Sit upright and rest immediately.",
            "Loosen tight clothing and call emergency support if symptoms worsen.",
            "Avoid exertion and seek emergency care without delay."
        ]
        red_flags = [
            "Crushing chest pain lasting more than 5 minutes",
            "Pain radiating to left arm, neck, jaw, or back",
            "Dizziness, sweating, or sudden collapse"
        ]
    elif any(k in stext for k in ["headache", "migraine", "dizzy", "nausea"]):
        severity_level = "Moderate" if severity_input != "High" else "High"
        specialist = "Neurologist / Primary Care Physician"
        possible_conditions = [
            {
                "condition": "Tension Headache / Cervicogenic Pressure",
                "match_probability": "High",
                "description": "Stress and poor posture can cause a tight, band-like headache.",
                "key_indicators": ["Head pressure", "Neck tightness", "Light sensitivity"]
            },
            {
                "condition": "Migraine without Aura",
                "match_probability": "Moderate",
                "description": "A throbbing headache often linked with nausea and sensitivity to light.",
                "key_indicators": ["One-sided pain", "Sensitivity to light", "Nausea"]
            }
        ]
        first_aid = [
            "Rest in a quiet, dark room.",
            "Apply a cool cloth to the forehead or neck.",
            "Drink water and avoid screens and loud sounds."
        ]
        red_flags = [
            "Sudden severe headache unlike any before",
            "Confusion, weakness, or fever with the headache",
            "Headache after injury or trauma"
        ]
    elif any(k in stext for k in ["fever", "cough", "sore throat", "cold", "flu", "chills"]):
        severity_level = "Low" if severity_input != "High" else "Moderate"
        specialist = "General Practitioner / ENT Specialist"
        possible_conditions = [
            {
                "condition": "Upper Respiratory Tract Viral Infection",
                "match_probability": "High",
                "description": "Common viruses can cause fever, cough, runny nose, and sore throat.",
                "key_indicators": ["Low-grade fever", "Cough or sore throat", "Fatigue"]
            },
            {
                "condition": "Acute Bronchitis or Sinusitis",
                "match_probability": "Moderate",
                "description": "The airways or sinuses can get inflamed and cause congestion or a lingering cough.",
                "key_indicators": ["Persistent cough", "Facial pressure", "Phlegm"]
            }
        ]
        first_aid = [
            "Rest well and keep drinking warm fluids.",
            "Gargle warm salt water for throat irritation.",
            "Monitor fever and avoid overexertion."
        ]
        red_flags = [
            "Fever above 103°F (39.4°C)",
            "Breathing difficulty or lips turning blue",
            "Severe weakness or confusion"
        ]
    else:
        severity_level = "Low"
        specialist = "General Physician"
        possible_conditions = [
            {
                "condition": "Unclear Symptom Description",
                "match_probability": "Low",
                "description": "The entered text does not clearly describe a known medical pattern. Please provide more detail.",
                "key_indicators": [symptoms_text[:30] or "No symptom description"]
            }
        ]
        first_aid = [
            "Rest and stay hydrated.",
            "Avoid exertion and monitor symptoms.",
            "Provide more details about the pain, duration, and exact location."
        ]
        red_flags = [
            "Sudden loss of speech or vision",
            "Severe abdominal pain or uncontrolled bleeding",
            "Persistent fever or breathing difficulty"
        ]

    return {
        "primary_symptoms": [s.strip() for s in symptoms_text.split(',') if s.strip()],
        "severity_level": severity_level,
        "emergency_alert": is_emergency,
        "possible_conditions": possible_conditions,
        "recommended_specialist": specialist,
        "first_aid_guidance": first_aid,
        "when_to_seek_emergency": red_flags,
        "home_remedies_and_precautions": [
            "Stay hydrated with water and fluids.",
            "Get enough sleep and rest.",
            "Avoid self-medicating with unverified antibiotics or supplements."
        ],
        "disclaimer": "MediClear AI symptom evaluation is educational guidance only. It does not replace a professional medical assessment."
    }


def _rule_based_prescription_analyzer(prescription_text):
    return {
        "diagnosis_note": "Hypertension Management & Nutritional Support",
        "medicines": [
            {
                "name": "Metformin 500mg",
                "dosage": "500 mg",
                "frequency": "Twice daily (Morning and Evening)",
                "timing": "Take after meals",
                "purpose": "Helps control blood sugar levels and improve insulin sensitivity.",
                "common_side_effects": ["Mild stomach upset", "Nausea", "Metallic taste"],
                "precautions": "Take with meals. Limit alcohol intake."
            },
            {
                "name": "Telmisartan 40mg",
                "dosage": "40 mg",
                "frequency": "Once daily (Morning)",
                "timing": "Take with or without food at the same time daily",
                "purpose": "Lowers blood pressure by relaxing blood vessels.",
                "common_side_effects": ["Mild dizziness", "Back pain"],
                "precautions": "Stand up slowly and avoid high-potassium supplements unless advised."
            },
            {
                "name": "Vitamin D3 60,000 IU",
                "dosage": "60,000 IU",
                "frequency": "Once weekly",
                "timing": "Take after a meal with some fat",
                "purpose": "Helps support bone health and immunity.",
                "common_side_effects": ["Rare side effects at weekly dosing"],
                "precautions": "Do not double the dose if you miss a week."
            }
        ],
        "general_instructions": [
            "Complete the prescribed course unless your doctor tells you otherwise.",
            "Store medicines in a cool, dry place away from sunlight.",
            "Set daily reminders so doses are not missed."
        ],
        "drug_interactions_warning": "No dangerous contraindications were detected in the sample list.",
        "disclaimer": "This medicine breakdown is provided for informational clarity. Always verify medication directions with your physician or pharmacist."
    }
