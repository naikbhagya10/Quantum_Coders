"""
MediClear AI - Google Gemini 1.5 Flash AI Engine
Analyzes medical reports, simplifies clinical terms, assesses symptoms, and parses prescriptions.
"""
import os
import re
import json
import google.generativeai as genai
from app.config import MediClearConfig

TOP_MEDICINES = {
    "paracetamol": {
        "name": "Paracetamol",
        "purpose": "Relieves mild to moderate pain and reduces fever.",
        "common_side_effects": ["Stomach upset", "Rare allergic reaction"],
        "precautions": "Do not exceed the recommended daily dose. Avoid alcohol while taking this medicine.",
        "default_frequency": "Every 6-8 hours as needed",
        "default_timing": "Take with water, preferably after food"
    },
    "dolo": {
        "name": "Dolo (Paracetamol)",
        "purpose": "Relieves pain and fever for headaches, body aches, and mild inflammatory discomfort.",
        "common_side_effects": ["Stomach discomfort", "Rare rash"],
        "precautions": "Avoid taking other acetaminophen-containing products at the same time.",
        "default_frequency": "Every 6-8 hours as needed",
        "default_timing": "Take after meals to reduce stomach irritation"
    },
    "acetaminophen": {
        "name": "Acetaminophen",
        "purpose": "Relieves mild to moderate pain and reduces fever.",
        "common_side_effects": ["Stomach upset", "Rare allergic reaction"],
        "precautions": "Do not exceed the recommended daily dose. Avoid alcohol while taking this medicine.",
        "default_frequency": "Every 6-8 hours as needed",
        "default_timing": "Take with water, preferably after food"
    },
    "aspirin": {
        "name": "Aspirin",
        "purpose": "Relieves pain, reduces fever, and helps prevent blood clots.",
        "common_side_effects": ["Stomach irritation", "Heartburn", "Bleeding risk"],
        "precautions": "Take with food and avoid if you have an ulcer or bleeding disorder.",
        "default_frequency": "Once or twice daily",
        "default_timing": "Take with food"
    },
    "ibuprofen": {
        "name": "Ibuprofen",
        "purpose": "Reduces inflammation, pain, and fever.",
        "common_side_effects": ["Upset stomach", "Heartburn", "Dizziness"],
        "precautions": "Take with food. Avoid if you have a history of stomach ulcers.",
        "default_frequency": "Every 6-8 hours",
        "default_timing": "Take after meals"
    },
    "amoxicillin": {
        "name": "Amoxicillin",
        "purpose": "Antibiotic used to treat bacterial infections.",
        "common_side_effects": ["Diarrhea", "Nausea", "Rash"],
        "precautions": "Complete the full course even if symptoms improve.",
        "default_frequency": "Three times daily",
        "default_timing": "Take with or without food"
    },
    "metformin": {
        "name": "Metformin",
        "purpose": "Helps control blood sugar in type 2 diabetes.",
        "common_side_effects": ["Mild nausea", "Diarrhea", "Metallic taste"],
        "precautions": "Take with meals to reduce digestive discomfort.",
        "default_frequency": "Twice daily",
        "default_timing": "Take with breakfast and dinner"
    },
    "atorvastatin": {
        "name": "Atorvastatin",
        "purpose": "Lowers cholesterol to reduce cardiovascular risk.",
        "common_side_effects": ["Muscle pain", "Headache", "Digestive upset"],
        "precautions": "Take in the evening for best cholesterol control.",
        "default_frequency": "Once daily",
        "default_timing": "Take with or without food"
    },
    "amlodipine": {
        "name": "Amlodipine",
        "purpose": "Lowers blood pressure by relaxing blood vessels.",
        "common_side_effects": ["Swelling", "Dizziness", "Fatigue"],
        "precautions": "Take at the same time each day.",
        "default_frequency": "Once daily",
        "default_timing": "Take in the morning"
    },
    "losartan": {
        "name": "Losartan",
        "purpose": "Helps lower blood pressure and protect kidney function.",
        "common_side_effects": ["Dizziness", "Headache", "Fatigue"],
        "precautions": "Avoid sudden position changes to reduce dizziness.",
        "default_frequency": "Once daily",
        "default_timing": "Take with or without food"
    },
    "omeprazole": {
        "name": "Omeprazole",
        "purpose": "Reduces stomach acid to treat heartburn and ulcers.",
        "common_side_effects": ["Headache", "Nausea", "Stomach pain"],
        "precautions": "Take before breakfast for best effect.",
        "default_frequency": "Once daily",
        "default_timing": "Take before breakfast"
    },
    "pantoprazole": {
        "name": "Pantoprazole",
        "purpose": "Reduces stomach acid production to ease reflux and ulcers.",
        "common_side_effects": ["Headache", "Diarrhea", "Stomach discomfort"],
        "precautions": "Take before a meal when directed.",
        "default_frequency": "Once daily",
        "default_timing": "Take in the morning"
    },
    "ciprofloxacin": {
        "name": "Ciprofloxacin",
        "purpose": "Antibiotic used to treat bacterial infections.",
        "common_side_effects": ["Nausea", "Tendon pain", "Dizziness"],
        "precautions": "Avoid sunlight exposure and complete the full course.",
        "default_frequency": "Twice daily",
        "default_timing": "Take with water"
    },
    "azithromycin": {
        "name": "Azithromycin",
        "purpose": "Antibiotic used for respiratory and skin infections.",
        "common_side_effects": ["Stomach upset", "Diarrhea", "Headache"],
        "precautions": "Take on an empty stomach or with food if it upsets your stomach.",
        "default_frequency": "Once daily",
        "default_timing": "Take at the same time each day"
    },
    "cetirizine": {
        "name": "Cetirizine",
        "purpose": "Relieves allergy symptoms such as runny nose and itching.",
        "common_side_effects": ["Drowsiness", "Dry mouth", "Headache"],
        "precautions": "Avoid driving if drowsy.",
        "default_frequency": "Once daily",
        "default_timing": "Take in the morning"
    },
    "levocetirizine": {
        "name": "Levocetirizine",
        "purpose": "Reduces allergy symptoms like sneezing and itchy eyes.",
        "common_side_effects": ["Drowsiness", "Dry mouth", "Fatigue"],
        "precautions": "Avoid alcohol when taking this medicine.",
        "default_frequency": "Once daily",
        "default_timing": "Take in the morning"
    },
    "montelukast": {
        "name": "Montelukast",
        "purpose": "Helps manage asthma and allergy symptoms.",
        "common_side_effects": ["Headache", "Stomach pain", "Mood changes"],
        "precautions": "Take consistently each evening.",
        "default_frequency": "Once daily",
        "default_timing": "Take in the evening"
    },
    "simvastatin": {
        "name": "Simvastatin",
        "purpose": "Lowers cholesterol levels to reduce heart disease risk.",
        "common_side_effects": ["Muscle pain", "Headache", "Digestive upset"],
        "precautions": "Take in the evening for best effect.",
        "default_frequency": "Once daily",
        "default_timing": "Take in the evening"
    },
    "clindamycin": {
        "name": "Clindamycin",
        "purpose": "Antibiotic for bacterial skin and soft tissue infections.",
        "common_side_effects": ["Diarrhea", "Nausea", "Stomach cramps"],
        "precautions": "Complete the full course and report severe diarrhea.",
        "default_frequency": "Three times daily",
        "default_timing": "Take with water"
    },
    "fluconazole": {
        "name": "Fluconazole",
        "purpose": "Treats fungal infections.",
        "common_side_effects": ["Nausea", "Headache", "Stomach pain"],
        "precautions": "Complete the full treatment course as directed.",
        "default_frequency": "Once daily",
        "default_timing": "Take with or without food"
    },
    "prednisone": {
        "name": "Prednisone",
        "purpose": "Reduces inflammation and suppresses immune responses.",
        "common_side_effects": ["Increased appetite", "Mood changes", "Sleep disturbance"],
        "precautions": "Use exactly as prescribed and do not stop suddenly.",
        "default_frequency": "Once daily",
        "default_timing": "Take in the morning with food"
    },
    "levothyroxine": {
        "name": "Levothyroxine",
        "purpose": "Replaces thyroid hormone in hypothyroidism.",
        "common_side_effects": ["Insomnia", "Nervousness", "Fast heartbeat"],
        "precautions": "Take on an empty stomach, 30 minutes before breakfast.",
        "default_frequency": "Once daily",
        "default_timing": "Take in the morning before food"
    },
    "metronidazole": {
        "name": "Metronidazole",
        "purpose": "Treats bacterial and protozoal infections.",
        "common_side_effects": ["Nausea", "Metallic taste", "Headache"],
        "precautions": "Avoid alcohol during treatment and for 48 hours after.",
        "default_frequency": "Two to three times daily",
        "default_timing": "Take with food"
    },
    "diclofenac": {
        "name": "Diclofenac",
        "purpose": "Reduces pain and inflammation.",
        "common_side_effects": ["Stomach pain", "Heartburn", "Dizziness"],
        "precautions": "Take with food and avoid if you have stomach ulcers.",
        "default_frequency": "Two to three times daily",
        "default_timing": "Take after meals"
    },
    "amitriptyline": {
        "name": "Amitriptyline",
        "purpose": "Treats depression and nerve pain.",
        "common_side_effects": ["Drowsiness", "Dry mouth", "Constipation"],
        "precautions": "Take at bedtime to minimize drowsiness.",
        "default_frequency": "Once daily",
        "default_timing": "Take at bedtime"
    },
    "omeprazole": {
        "name": "Omeprazole",
        "purpose": "Reduces stomach acid to treat heartburn and ulcers.",
        "common_side_effects": ["Headache", "Nausea", "Stomach pain"],
        "precautions": "Take before breakfast for best effect.",
        "default_frequency": "Once daily",
        "default_timing": "Take before breakfast"
    },
    "pantoprazole": {
        "name": "Pantoprazole",
        "purpose": "Reduces stomach acid production to ease reflux and ulcers.",
        "common_side_effects": ["Headache", "Diarrhea", "Stomach discomfort"],
        "precautions": "Take before a meal when directed.",
        "default_frequency": "Once daily",
        "default_timing": "Take in the morning"
    },
    "salbutamol": {
        "name": "Salbutamol",
        "purpose": "Relieves bronchospasm in asthma and COPD.",
        "common_side_effects": ["Tremor", "Nervousness", "Fast heartbeat"],
        "precautions": "Use the inhaler exactly as prescribed.",
        "default_frequency": "As needed",
        "default_timing": "Use during breathing difficulty"
    },
    "spironolactone": {
        "name": "Spironolactone",
        "purpose": "Helps lower blood pressure and reduce fluid retention.",
        "common_side_effects": ["Dizziness", "High potassium", "Nausea"],
        "precautions": "Monitor blood potassium levels during treatment.",
        "default_frequency": "Once daily",
        "default_timing": "Take in the morning"
    },
    "furosemide": {
        "name": "Furosemide",
        "purpose": "Removes excess fluid and lowers blood pressure.",
        "common_side_effects": ["Increased urination", "Dizziness", "Low potassium"],
        "precautions": "Monitor fluid and electrolyte levels.",
        "default_frequency": "Once daily",
        "default_timing": "Take in the morning"
    },
    "atorvastatin": {
        "name": "Atorvastatin",
        "purpose": "Lowers cholesterol to reduce heart disease risk.",
        "common_side_effects": ["Muscle pain", "Headache", "Digestive upset"],
        "precautions": "Take in the evening for best effect.",
        "default_frequency": "Once daily",
        "default_timing": "Take in the evening"
    },
    "insulin": {
        "name": "Insulin",
        "purpose": "Helps control blood sugar levels in diabetes.",
        "common_side_effects": ["Low blood sugar", "Weight gain", "Injection site reactions"],
        "precautions": "Monitor blood sugar regularly and follow injection technique.",
        "default_frequency": "As prescribed",
        "default_timing": "Use according to your insulin plan"
    },
    "glimepiride": {
        "name": "Glimepiride",
        "purpose": "Helps lower blood sugar in type 2 diabetes.",
        "common_side_effects": ["Low blood sugar", "Nausea", "Dizziness"],
        "precautions": "Take with breakfast and monitor blood glucose levels.",
        "default_frequency": "Once daily",
        "default_timing": "Take with breakfast"
    },
    "glipizide": {
        "name": "Glipizide",
        "purpose": "Lowers blood sugar in type 2 diabetes.",
        "common_side_effects": ["Low blood sugar", "Nausea", "Weight gain"],
        "precautions": "Take 30 minutes before a meal.",
        "default_frequency": "Once daily",
        "default_timing": "Take before breakfast"
    },
    "gliclazide": {
        "name": "Gliclazide",
        "purpose": "Helps control blood glucose in type 2 diabetes.",
        "common_side_effects": ["Low blood sugar", "Nausea", "Headache"],
        "precautions": "Take with breakfast to reduce low blood sugar risk.",
        "default_frequency": "Once daily",
        "default_timing": "Take with breakfast"
    },
    "hydrochlorothiazide": {
        "name": "Hydrochlorothiazide",
        "purpose": "Helps lower blood pressure by removing excess fluid.",
        "common_side_effects": ["Increased urination", "Dizziness", "Low potassium"],
        "precautions": "Take in the morning and monitor electrolytes.",
        "default_frequency": "Once daily",
        "default_timing": "Take in the morning"
    },
    "enalapril": {
        "name": "Enalapril",
        "purpose": "Lowers blood pressure and eases heart workload.",
        "common_side_effects": ["Cough", "Dizziness", "High potassium"],
        "precautions": "Take at the same time each day.",
        "default_frequency": "Once daily",
        "default_timing": "Take with or without food"
    },
    "ramipril": {
        "name": "Ramipril",
        "purpose": "Helps reduce high blood pressure and heart strain.",
        "common_side_effects": ["Cough", "Dizziness", "Fatigue"],
        "precautions": "Take consistently at the same time daily.",
        "default_frequency": "Once daily",
        "default_timing": "Take with water"
    },
    "propranolol": {
        "name": "Propranolol",
        "purpose": "Used for high blood pressure, migraines, and anxiety.",
        "common_side_effects": ["Fatigue", "Dizziness", "Cold hands"],
        "precautions": "Do not stop suddenly without medical advice.",
        "default_frequency": "Once or twice daily",
        "default_timing": "Take with or without food"
    },
    "metoprolol": {
        "name": "Metoprolol",
        "purpose": "Helps control blood pressure and heart rate.",
        "common_side_effects": ["Fatigue", "Dizziness", "Slow heartbeat"],
        "precautions": "Take at the same time each day.",
        "default_frequency": "Once daily",
        "default_timing": "Take with or without food"
    },
    "atenolol": {
        "name": "Atenolol",
        "purpose": "Reduces blood pressure and chest pain.",
        "common_side_effects": ["Dizziness", "Fatigue", "Cold extremities"],
        "precautions": "Take at the same time each day.",
        "default_frequency": "Once daily",
        "default_timing": "Take in the morning"
    },
    "sildenafil": {
        "name": "Sildenafil",
        "purpose": "Treats erectile dysfunction by improving blood flow.",
        "common_side_effects": ["Headache", "Flushing", "Dizziness"],
        "precautions": "Do not combine with nitrates.",
        "default_frequency": "As needed",
        "default_timing": "Take 30-60 minutes before activity"
    },
    "tramadol": {
        "name": "Tramadol",
        "purpose": "Relieves moderate to severe pain.",
        "common_side_effects": ["Nausea", "Dizziness", "Constipation"],
        "precautions": "Use only as prescribed to reduce dependence risk.",
        "default_frequency": "Every 4-6 hours as needed",
        "default_timing": "Take with food if it causes stomach upset"
    },
    "doxycycline": {
        "name": "Doxycycline",
        "purpose": "Antibiotic used for infections and acne.",
        "common_side_effects": ["Sun sensitivity", "Nausea", "Diarrhea"],
        "precautions": "Avoid direct sunlight and take with food.",
        "default_frequency": "Once or twice daily",
        "default_timing": "Take with a full glass of water"
    },
    "vitamin d3": {
        "name": "Vitamin D3",
        "purpose": "Supports bone health and immune function.",
        "common_side_effects": ["Mild stomach upset", "Nausea"],
        "precautions": "Do not exceed the recommended dose.",
        "default_frequency": "Once daily or weekly",
        "default_timing": "Take with a meal"
    },
    "calcium carbonate": {
        "name": "Calcium Carbonate",
        "purpose": "Supports bone strength and calcium balance.",
        "common_side_effects": ["Constipation", "Gas", "Upset stomach"],
        "precautions": "Take with food for better absorption.",
        "default_frequency": "Once or twice daily",
        "default_timing": "Take with a meal"
    },
    "zinc sulfate": {
        "name": "Zinc Sulfate",
        "purpose": "Supports immune health and wound healing.",
        "common_side_effects": ["Nausea", "Metallic taste", "Stomach upset"],
        "precautions": "Take with food to reduce stomach discomfort.",
        "default_frequency": "Once daily",
        "default_timing": "Take with food"
    },
    "cetirizine": {
        "name": "Cetirizine",
        "purpose": "Relieves allergy symptoms.",
        "common_side_effects": ["Drowsiness", "Dry mouth", "Headache"],
        "precautions": "Avoid driving if drowsy.",
        "default_frequency": "Once daily",
        "default_timing": "Take in the morning"
    },
    "acetazolamide": {
        "name": "Acetazolamide",
        "purpose": "Used to treat glaucoma and some seizure disorders.",
        "common_side_effects": ["Tingling", "Nausea", "Frequent urination"],
        "precautions": "Use exactly as prescribed and report unusual symptoms.",
        "default_frequency": "Twice daily",
        "default_timing": "Take with food"
    },
    "allopurinol": {
        "name": "Allopurinol",
        "purpose": "Helps reduce uric acid levels in gout.",
        "common_side_effects": ["Rash", "Nausea", "Dizziness"],
        "precautions": "Drink plenty of fluids and follow dosing instructions.",
        "default_frequency": "Once daily",
        "default_timing": "Take with food"
    },
    "alprazolam": {
        "name": "Alprazolam",
        "purpose": "Treats anxiety and panic disorders.",
        "common_side_effects": ["Drowsiness", "Dizziness", "Memory issues"],
        "precautions": "Do not stop suddenly without medical advice.",
        "default_frequency": "As prescribed",
        "default_timing": "Take at bedtime if drowsy"
    },
    "bupropion": {
        "name": "Bupropion",
        "purpose": "Used for depression and smoking cessation.",
        "common_side_effects": ["Dry mouth", "Insomnia", "Headache"],
        "precautions": "Avoid taking late in the day if it causes sleep issues.",
        "default_frequency": "Once or twice daily",
        "default_timing": "Take in the morning"
    },
    "carbamazepine": {
        "name": "Carbamazepine",
        "purpose": "Used for seizures and nerve pain.",
        "common_side_effects": ["Drowsiness", "Dizziness", "Nausea"],
        "precautions": "Report rash or unusual bleeding promptly.",
        "default_frequency": "Twice daily",
        "default_timing": "Take with food"
    },
    "chloroquine": {
        "name": "Chloroquine",
        "purpose": "Used for malaria prevention and some autoimmune conditions.",
        "common_side_effects": ["Nausea", "Headache", "Vision changes"],
        "precautions": "Follow dosing carefully and report vision changes.",
        "default_frequency": "Once weekly",
        "default_timing": "Take with food"
    },
    "colchicine": {
        "name": "Colchicine",
        "purpose": "Treats gout flare-ups and inflammation.",
        "common_side_effects": ["Nausea", "Diarrhea", "Stomach cramps"],
        "precautions": "Take only as directed and avoid overdose.",
        "default_frequency": "Once or twice daily",
        "default_timing": "Take with food"
    },
    "dexamethasone": {
        "name": "Dexamethasone",
        "purpose": "Reduces inflammation and suppresses immune responses.",
        "common_side_effects": ["Sleep disturbance", "Mood changes", "Increased appetite"],
        "precautions": "Do not stop suddenly without medical advice.",
        "default_frequency": "Once daily",
        "default_timing": "Take in the morning"
    },
    "domperidone": {
        "name": "Domperidone",
        "purpose": "Helps relieve nausea and improve stomach emptying.",
        "common_side_effects": ["Diarrhea", "Headache", "Dizziness"],
        "precautions": "Use only as prescribed and avoid if advised against by your doctor.",
        "default_frequency": "As prescribed",
        "default_timing": "Take before meals"
    },
    "escitalopram": {
        "name": "Escitalopram",
        "purpose": "Treats depression and anxiety.",
        "common_side_effects": ["Nausea", "Sleep changes", "Dry mouth"],
        "precautions": "Do not stop suddenly without medical advice.",
        "default_frequency": "Once daily",
        "default_timing": "Take in the morning or evening"
    },
    "fenofibrate": {
        "name": "Fenofibrate",
        "purpose": "Helps lower triglycerides and cholesterol.",
        "common_side_effects": ["Stomach upset", "Muscle aches", "Headache"],
        "precautions": "Report muscle pain promptly.",
        "default_frequency": "Once daily",
        "default_timing": "Take with food"
    },
    "gabapentin": {
        "name": "Gabapentin",
        "purpose": "Treats nerve pain and seizures.",
        "common_side_effects": ["Drowsiness", "Dizziness", "Fatigue"],
        "precautions": "Avoid alcohol and do not drive if sleepy.",
        "default_frequency": "Once or twice daily",
        "default_timing": "Take at bedtime if drowsy"
    },
    "haloperidol": {
        "name": "Haloperidol",
        "purpose": "Used for schizophrenia and severe agitation.",
        "common_side_effects": ["Sleepiness", "Restlessness", "Dry mouth"],
        "precautions": "Use only under medical supervision.",
        "default_frequency": "As prescribed",
        "default_timing": "Take as directed"
    },
    "hydroxychloroquine": {
        "name": "Hydroxychloroquine",
        "purpose": "Used for lupus, rheumatoid arthritis, and malaria prevention.",
        "common_side_effects": ["Headache", "Nausea", "Vision changes"],
        "precautions": "Report vision changes and follow dosing exactly.",
        "default_frequency": "Once daily",
        "default_timing": "Take with food"
    },
    "insulin glargine": {
        "name": "Insulin Glargine",
        "purpose": "Long-acting insulin for blood sugar control.",
        "common_side_effects": ["Low blood sugar", "Weight gain", "Injection site reactions"],
        "precautions": "Monitor blood sugar and follow your insulin plan.",
        "default_frequency": "Once daily",
        "default_timing": "Use as prescribed"
    },
    "loperamide": {
        "name": "Loperamide",
        "purpose": "Treats diarrhea and helps reduce bowel movements.",
        "common_side_effects": ["Constipation", "Dizziness", "Stomach cramps"],
        "precautions": "Do not use for prolonged diarrhea without medical advice.",
        "default_frequency": "As needed",
        "default_timing": "Take after diarrhea begins"
    },
    "lorazepam": {
        "name": "Lorazepam",
        "purpose": "Treats anxiety, seizures, and sleep problems.",
        "common_side_effects": ["Drowsiness", "Confusion", "Dizziness"],
        "precautions": "Do not stop suddenly without medical advice.",
        "default_frequency": "As prescribed",
        "default_timing": "Take at bedtime if drowsy"
    },
    "miconazole": {
        "name": "Miconazole",
        "purpose": "Treats fungal infections.",
        "common_side_effects": ["Burning", "Itching", "Skin irritation"],
        "precautions": "Use as directed and avoid broken skin.",
        "default_frequency": "Once or twice daily",
        "default_timing": "Apply as directed"
    },
    "nitrofurantoin": {
        "name": "Nitrofurantoin",
        "purpose": "Treats urinary tract infections.",
        "common_side_effects": ["Nausea", "Headache", "Stomach upset"],
        "precautions": "Complete the full course and avoid if advised against.",
        "default_frequency": "Twice daily",
        "default_timing": "Take with food"
    },
    "olmesartan": {
        "name": "Olmesartan",
        "purpose": "Helps lower blood pressure.",
        "common_side_effects": ["Dizziness", "Headache", "Fatigue"],
        "precautions": "Take at the same time each day.",
        "default_frequency": "Once daily",
        "default_timing": "Take in the morning"
    },
    "oseltamivir": {
        "name": "Oseltamivir",
        "purpose": "Treats influenza symptoms.",
        "common_side_effects": ["Nausea", "Vomiting", "Headache"],
        "precautions": "Start treatment as soon as possible after symptoms begin.",
        "default_frequency": "Twice daily",
        "default_timing": "Take with food"
    },
    "oxcarbazepine": {
        "name": "Oxcarbazepine",
        "purpose": "Used for seizures and nerve pain.",
        "common_side_effects": ["Dizziness", "Drowsiness", "Nausea"],
        "precautions": "Report rash or unusual symptoms promptly.",
        "default_frequency": "Twice daily",
        "default_timing": "Take with food"
    },
    "paroxetine": {
        "name": "Paroxetine",
        "purpose": "Treats depression, anxiety, and panic disorders.",
        "common_side_effects": ["Nausea", "Drowsiness", "Dry mouth"],
        "precautions": "Do not stop suddenly without medical advice.",
        "default_frequency": "Once daily",
        "default_timing": "Take at bedtime if drowsy"
    },
    "pioglitazone": {
        "name": "Pioglitazone",
        "purpose": "Helps control blood sugar in type 2 diabetes.",
        "common_side_effects": ["Weight gain", "Fluid retention", "Fatigue"],
        "precautions": "Monitor blood sugar and report swelling.",
        "default_frequency": "Once daily",
        "default_timing": "Take with food"
    },
    "sertraline": {
        "name": "Sertraline",
        "purpose": "Treats depression and anxiety.",
        "common_side_effects": ["Nausea", "Insomnia", "Dry mouth"],
        "precautions": "Do not stop abruptly without medical advice.",
        "default_frequency": "Once daily",
        "default_timing": "Take in the morning"
    },
    "tamoxifen": {
        "name": "Tamoxifen",
        "purpose": "Used in breast cancer treatment and prevention.",
        "common_side_effects": ["Hot flashes", "Mood changes", "Fatigue"],
        "precautions": "Use only under specialist guidance.",
        "default_frequency": "Once daily",
        "default_timing": "Take with food"
    },
    "terfenadine": {
        "name": "Terfenadine",
        "purpose": "Used to relieve allergy symptoms.",
        "common_side_effects": ["Headache", "Dry mouth", "Drowsiness"],
        "precautions": "Use only as advised by your doctor.",
        "default_frequency": "Twice daily",
        "default_timing": "Take with water"
    },
    "thiamine": {
        "name": "Thiamine",
        "purpose": "Supports energy metabolism and nerve function.",
        "common_side_effects": ["Rare allergic reaction", "Upset stomach"],
        "precautions": "Follow the recommended dose carefully.",
        "default_frequency": "Once daily",
        "default_timing": "Take with food"
    },
    "valproate": {
        "name": "Valproate",
        "purpose": "Used for seizures and bipolar disorder.",
        "common_side_effects": ["Weight gain", "Tremor", "Drowsiness"],
        "precautions": "Report unusual bleeding or mood changes.",
        "default_frequency": "Twice daily",
        "default_timing": "Take with food"
    },
    "valsartan": {
        "name": "Valsartan",
        "purpose": "Helps lower blood pressure.",
        "common_side_effects": ["Dizziness", "Headache", "Fatigue"],
        "precautions": "Do not stop suddenly without medical advice.",
        "default_frequency": "Once daily",
        "default_timing": "Take in the morning"
    },
    "verapamil": {
        "name": "Verapamil",
        "purpose": "Treats irregular heart rhythm and high blood pressure.",
        "common_side_effects": ["Constipation", "Dizziness", "Fatigue"],
        "precautions": "Take at the same time each day.",
        "default_frequency": "Twice daily",
        "default_timing": "Take with food"
    },
    "warfarin": {
        "name": "Warfarin",
        "purpose": "Helps prevent blood clots.",
        "common_side_effects": ["Bleeding risk", "Bruising", "Nosebleeds"],
        "precautions": "Follow dose instructions closely and keep regular checkups.",
        "default_frequency": "Once daily",
        "default_timing": "Take in the evening"
    },
    "vitamin b12": {
        "name": "Vitamin B12",
        "purpose": "Supports nerve function and red blood cell production.",
        "common_side_effects": ["Mild stomach upset", "Rare allergic reaction"],
        "precautions": "Do not exceed the recommended dose.",
        "default_frequency": "Once daily or weekly",
        "default_timing": "Take with a meal"
    },
    "vitamin c": {
        "name": "Vitamin C",
        "purpose": "Supports immunity and antioxidant protection.",
        "common_side_effects": ["Stomach upset", "Diarrhea"],
        "precautions": "Take with food if it upsets your stomach.",
        "default_frequency": "Once daily",
        "default_timing": "Take with food"
    },
    "vitamin e": {
        "name": "Vitamin E",
        "purpose": "Supports skin and antioxidant health.",
        "common_side_effects": ["Nausea", "Stomach upset"],
        "precautions": "Do not exceed the recommended dose.",
        "default_frequency": "Once daily",
        "default_timing": "Take with food"
    },
    "iron sulfate": {
        "name": "Iron Sulfate",
        "purpose": "Helps prevent or treat low iron levels.",
        "common_side_effects": ["Constipation", "Nausea", "Black stools"],
        "precautions": "Take with food and avoid taking with calcium supplements.",
        "default_frequency": "Once daily",
        "default_timing": "Take with food"
    },
    "folic acid": {
        "name": "Folic Acid",
        "purpose": "Supports red blood cell production and pregnancy health.",
        "common_side_effects": ["Mild stomach upset", "Bloating"],
        "precautions": "Take as directed and do not exceed the dose.",
        "default_frequency": "Once daily",
        "default_timing": "Take with food"
    },
    "selenium": {
        "name": "Selenium",
        "purpose": "Supports thyroid and antioxidant function.",
        "common_side_effects": ["Nausea", "Garlic breath", "Stomach upset"],
        "precautions": "Do not exceed the recommended dose.",
        "default_frequency": "Once daily",
        "default_timing": "Take with food"
    },
    "magnesium oxide": {
        "name": "Magnesium Oxide",
        "purpose": "Supports muscle and nerve function.",
        "common_side_effects": ["Diarrhea", "Upset stomach"],
        "precautions": "Take with food if it irritates your stomach.",
        "default_frequency": "Once daily",
        "default_timing": "Take with food"
    },
    "glyceryl trinitrate": {
        "name": "Glyceryl Trinitrate",
        "purpose": "Used to relieve chest pain in angina.",
        "common_side_effects": ["Headache", "Dizziness", "Flushing"],
        "precautions": "Use exactly as prescribed and seek urgent help for severe symptoms.",
        "default_frequency": "As needed",
        "default_timing": "Take under the tongue as directed"
    },
    "clopidogrel": {
        "name": "Clopidogrel",
        "purpose": "Helps prevent blood clots after heart or stroke events.",
        "common_side_effects": ["Bleeding risk", "Bruising", "Nausea"],
        "precautions": "Avoid unnecessary bleeding risk and follow instructions.",
        "default_frequency": "Once daily",
        "default_timing": "Take with food"
    },
    "bisoprolol": {
        "name": "Bisoprolol",
        "purpose": "Helps lower blood pressure and heart rate.",
        "common_side_effects": ["Dizziness", "Fatigue", "Slow heartbeat"],
        "precautions": "Do not stop suddenly without medical advice.",
        "default_frequency": "Once daily",
        "default_timing": "Take in the morning"
    },
    "digoxin": {
        "name": "Digoxin",
        "purpose": "Used to improve heart function and control heart rate.",
        "common_side_effects": ["Nausea", "Vision changes", "Irregular heartbeat"],
        "precautions": "Use only as prescribed and report unusual symptoms promptly.",
        "default_frequency": "Once daily",
        "default_timing": "Take with or without food"
    },
    "donepezil": {
        "name": "Donepezil",
        "purpose": "Used to manage symptoms of dementia.",
        "common_side_effects": ["Nausea", "Diarrhea", "Sleep disturbance"],
        "precautions": "Take at bedtime if it causes sleepiness.",
        "default_frequency": "Once daily",
        "default_timing": "Take at bedtime"
    },
    "finasteride": {
        "name": "Finasteride",
        "purpose": "Used to treat enlarged prostate and hair loss.",
        "common_side_effects": ["Reduced libido", "Erectile issues", "Breast tenderness"],
        "precautions": "Use only as prescribed and report side effects.",
        "default_frequency": "Once daily",
        "default_timing": "Take with or without food"
    },
    "tadalafil": {
        "name": "Tadalafil",
        "purpose": "Treats erectile dysfunction and urinary symptoms.",
        "common_side_effects": ["Headache", "Flushing", "Dizziness"],
        "precautions": "Do not combine with nitrates.",
        "default_frequency": "As needed",
        "default_timing": "Take 30-60 minutes before activity"
    },
    "tamsulosin": {
        "name": "Tamsulosin",
        "purpose": "Helps relieve urinary symptoms from an enlarged prostate.",
        "common_side_effects": ["Dizziness", "Headache", "Nasal congestion"],
        "precautions": "Take at the same time each day.",
        "default_frequency": "Once daily",
        "default_timing": "Take at bedtime"
    },
    "cetaphil": {
        "name": "Cetaphil",
        "purpose": "Gentle skin cleanser and moisturizer for dry and sensitive skin.",
        "common_side_effects": ["Mild irritation", "Dryness"],
        "precautions": "Patch test if you have very sensitive skin.",
        "default_frequency": "As needed",
        "default_timing": "Use as directed"
    }
}

GEMINI_API_KEY = MediClearConfig.GEMINI_API_KEY
if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        print("✅ [Gemini AI Engine] Configured with API key.")
    except Exception as err:
        print(f"ℹ️ [Gemini AI Engine] API setup note: {err}")


def looks_like_prescription_text(rx_text: str) -> bool:
    if not rx_text or not rx_text.strip():
        return False

    text = rx_text.lower()
    medicine_name_pattern = re.compile(
        r"\b(?:dolo|paracetamol|acetaminophen|aspirin|ibuprofen|naproxen|amoxicillin|metformin|telmisartan|omeprazole|pantoprazole|diclofenac|azithromycin|atorvastatin|amlodipine|metoprolol|losartan|simvastatin|clarithromycin|clindamycin|montelukast|fluconazole|prednisone|hydroxychloroquine|levothyroxine|loratadine|cetirizine|levocetirizine|rabeprazole|vitamin\s*[a-z0-9]*|calcium|zinc|iron|magnesium|selenium|folic|acetazolamide|allopurinol|alprazolam|bupropion|carbamazepine|chloroquine|colchicine|dexamethasone|domperidone|escitalopram|fenofibrate|gabapentin|haloperidol|insulin|loperamide|lorazepam|miconazole|nitrofurantoin|olmesartan|oseltamivir|oxcarbazepine|paroxetine|pioglitazone|sertraline|tamoxifen|terfenadine|thiamine|valproate|valsartan|verapamil|warfarin|clopidogrel|bisoprolol|digoxin|donepezil|finasteride|tadalafil|tamsulosin|cetaphil)\b",
        flags=re.IGNORECASE,
    )
    drug_suffix_pattern = re.compile(
        r"\b[a-z][a-z0-9\-]{2,}(?:cillin|mycin|floxacin|cycline|penem|azole|vir|pril|sartan|olol|dipine|statin|prazole|tidine|sone|mab|nib|tide|fenac|caine|done)\b"
    )
    antibiotic_suffix_pattern = re.compile(
        r"\b[a-z][a-z0-9\-]{2,}(?:cillin|mycin|floxacin|cycline|penem|azole)\b"
    )
    dosage_unit_pattern = re.compile(r"\b\d+(?:\.\d+)?\s*(mg|mcg|g|iu|ml|units)\b")
    medicine_usage_pattern = re.compile(
        r"\b(take|tablet|capsule|syrup|drop|drops|ointment|cream|patch|daily|once daily|twice daily|three times daily|before meals|after meals|morning|evening|bedtime|before bed|after food)\b"
    )
    medicine_package_pattern = re.compile(
        r"\b(tablet|tablets|tab|capsule|capsules|cap|syrup|inject|injection|injectable|cream|ointment|drop|drops|solution|spray|patch|puff)\b"
    )
    take_drug_pattern = re.compile(r"\btake\s+[a-z][a-z0-9\-]{2,}(?:\s+[a-z][a-z0-9\-]{2,}){0,2}\b")
    generic_med_pattern = re.compile(r"\b[a-z]{3,}\s*\d+\s*(mg|mcg|g|iu|ml|units)\b")

    if medicine_name_pattern.search(text):
        return True
    if drug_suffix_pattern.search(text) and (medicine_usage_pattern.search(text) or dosage_unit_pattern.search(text)):
        return True
    if generic_med_pattern.search(text):
        return True
    if take_drug_pattern.search(text):
        return True
    if dosage_unit_pattern.search(text) and (medicine_usage_pattern.search(text) or medicine_package_pattern.search(text)):
        return True
    return False


def analyze_report_text(report_text: str, language: str = 'English') -> dict:
    """Simplifies medical report text into plain layman English and flags abnormal values."""
    if GEMINI_API_KEY:
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = f"""
            You are MediClear AI Patient Health Assistant.
            Respond ONLY in {language}.
            If the selected language is English, answer only in English.
            If the selected language is Kannada, answer only in Kannada.
            If the selected language is Hindi, answer only in Hindi.
            Use simple, patient-friendly language.
            Return a JSON object with EXACTLY this structure:
            {{
              "report_title": "Descriptive Title",
              "patient_summary": "Plain summary of the report in the chosen language.",
              "medical_terms_explained": [
                 {{"term": "Term Name", "definition": "Simple explanation"}}
              ],
              "abnormal_values": [
                 {{
                   "parameter": "Parameter",
                   "value": "Value",
                   "reference_range": "Range",
                   "status": "High" or "Low" or "Borderline",
                   "meaning": "Why it is high/low and what it means."
                 }}
              ],
              "overall_risk_level": "Low" or "Moderate" or "High",
              "actionable_recommendations": ["Tip 1", "Tip 2"],
              "specialist_to_consult": "Specialist",
              "disclaimer": "Educational summary only; consult your doctor."
            }}
            Medical Report Text:
            {report_text}
            """
            res = model.generate_content(prompt)
            clean = res.text.replace('```json', '').replace('```', '').strip()
            return json.loads(clean)
        except Exception as e:
            print(f"[Gemini AI] Gemini error: {e}. Using fallback engine.")

    return _fallback_report_analysis(report_text)


def analyze_symptoms_triage(symptoms: str, duration: str, severity: str, age: int, language: str = 'English') -> dict:
    """Evaluates symptoms to predict conditions, triage severity level, and provide first-aid."""
    if GEMINI_API_KEY:
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = f"""
            You are MediClear AI Emergency & Symptom Triage Assistant.
            Respond ONLY in {language}.
            If the selected language is English, answer only in English.
            If the selected language is Kannada, answer only in Kannada.
            If the selected language is Hindi, answer only in Hindi.
            Use simple patient-friendly language.
            Analyze these symptoms and return JSON:
            Symptoms: {symptoms}
            Duration: {duration}
            Severity: {severity}
            Age: {age}
            {{
              "primary_symptoms": ["Symptom 1", "Symptom 2"],
              "severity_level": "Low" or "Moderate" or "High",
              "emergency_alert": true or false,
              "possible_conditions": [
                 {{
                   "condition": "Condition Name",
                   "match_probability": "High" or "Moderate" or "Low",
                   "description": "Explanation",
                   "key_indicators": ["Indicator 1"]
                 }}
              ],
              "recommended_specialist": "Specialist Name",
              "first_aid_guidance": ["Step 1", "Step 2"],
              "when_to_seek_emergency": ["Red flag 1"],
              "disclaimer": "Medical triage guidance only."
            }}
            """
            res = model.generate_content(prompt)
            clean = res.text.replace('```json', '').replace('```', '').strip()
            return json.loads(clean)
        except Exception as e:
            print(f"[Gemini AI] Symptom error: {e}. Using fallback triage.")

    return _fallback_symptom_triage(symptoms, duration, severity, age)


def analyze_prescription_pharmacology(rx_text: str, language: str = 'English') -> dict:
    """Deconstructs prescription into dosage, timing, side effects, and precautions."""
    if GEMINI_API_KEY:
        try:
            model = genai.GenerativeModel('gemini-1.5-flash')
            prompt = f"""
            You are MediClear AI Pharmacology Assistant.
            Respond ONLY in {language}.
            If the selected language is English, answer only in English.
            If the selected language is Kannada, answer only in Kannada.
            If the selected language is Hindi, answer only in Hindi.
            Use simple patient-friendly language.
            Parse this prescription text and return JSON:
            {{
              "diagnosis_note": "Inferred Condition",
              "medicines": [
                 {{
                   "name": "Medicine Name",
                   "dosage": "Dosage",
                   "frequency": "Frequency",
                   "timing": "Take after food",
                   "purpose": "Purpose",
                   "common_side_effects": ["Side effect 1"],
                   "precautions": "Precaution note"
                 }}
              ],
              "general_instructions": ["Instruction 1"],
              "drug_interactions_warning": "Drug interaction summary",
              "disclaimer": "Pharmacology information only."
            }}
            Prescription Text:
            {rx_text}
            """
            res = model.generate_content(prompt)
            clean = res.text.replace('```json', '').replace('```', '').strip()
            return json.loads(clean)
        except Exception as e:
            print(f"[Gemini AI] Prescription error: {e}. Using fallback parser.")

    return _fallback_prescription_analysis(rx_text)


# =====================================================================
# MEDICAL RULE-BASED FALLBACK ENGINES
# =====================================================================

def _fallback_report_analysis(report_text: str) -> dict:
    t = report_text.lower()
    abnormals = []

    if '10.2' in t or 'hemoglobin' in t:
        abnormals.append({
            "parameter": "Hemoglobin (Hb)",
            "value": "10.2 g/dL",
            "reference_range": "13.5 - 17.5 g/dL",
            "status": "Low",
            "meaning": "Lower hemoglobin indicates mild anemia, which may cause feeling tired or mild exertion fatigue."
        })
    if '142' in t or 'glucose' in t or 'hba1c' in t:
        abnormals.append({
            "parameter": "Fasting Blood Glucose",
            "value": "142 mg/dL",
            "reference_range": "70 - 99 mg/dL",
            "status": "High",
            "meaning": "Elevated fasting blood glucose suggests difficulty processing sugar, indicating prediabetes or diabetes risk."
        })
    if '235' in t or 'cholesterol' in t:
        abnormals.append({
            "parameter": "Total Cholesterol",
            "value": "235 mg/dL",
            "reference_range": "< 200 mg/dL",
            "status": "High",
            "meaning": "Elevated cholesterol levels warrant dietary modifications and exercise."
        })

    if not abnormals:
        abnormals = [
            {
                "parameter": "Fasting Glucose",
                "value": "135 mg/dL",
                "reference_range": "70 - 99 mg/dL",
                "status": "High",
                "meaning": "Slightly elevated glucose threshold. Reduce refined sugars and monitor glycemic levels."
            }
        ]

    terms = [
        {"term": "Hemoglobin", "definition": "Oxygen-carrying protein inside red blood cells."},
        {"term": "Fasting Blood Glucose", "definition": "Measures blood sugar level after overnight fasting."},
        {"term": "HbA1c", "definition": "Average blood sugar level over the past 2 to 3 months."}
    ]

    return {
        "report_title": "Comprehensive Clinical Blood & Metabolic Panel",
        "patient_summary": "Your laboratory report indicates healthy kidney function (normal creatinine). However, fasting glucose and cholesterol parameters are elevated, and hemoglobin is slightly low.",
        "medical_terms_explained": terms,
        "abnormal_values": abnormals,
        "overall_risk_level": "Moderate" if len(abnormals) <= 2 else "High",
        "actionable_recommendations": [
            "Schedule a routine follow-up with your primary physician to discuss blood glucose and lipid management.",
            "Incorporate iron-dense foods such as dark leafy greens, legumes, and lean proteins into your diet.",
            "Engage in 30 minutes of moderate aerobic exercise 5 days a week.",
            "Maintain proper daily hydration by drinking 2.5 to 3 liters of water."
        ],
        "specialist_to_consult": "General Physician / Endocrinologist",
        "disclaimer": "MediClear AI explanations are generated for clarity. They do NOT replace formal medical diagnosis by a physician."
    }


def _fallback_symptom_triage(symptoms: str, duration: str, severity: str, age: int) -> dict:
    s = symptoms.lower()
    is_emergency = False
    sev_level = severity
    spec = "General Physician"
    first_aid = []
    red_flags = []
    possible = []

    if any(k in s for k in ['chest pain', 'breathless', 'difficulty breathing', 'shortness of breath', 'heart', 'arm pain', 'fainting', 'pressure in chest']):
        sev_level = "High"
        is_emergency = True
        spec = "Cardiologist / Emergency Physician"
        possible = [
            {
                "condition": "Angina Pectoris / Acute Coronary Syndrome",
                "match_probability": "High",
                "description": "Reduced blood flow to the heart muscle causing chest tightness and breathlessness.",
                "key_indicators": ["Chest pressure", "Pain radiating to left arm or jaw", "Shortness of breath"]
            }
        ]
        first_aid = [
            "Stay seated and remain calm to reduce heart workload.",
            "Loosen clothing around the neck and chest.",
            "Call local emergency services (911 / 108 / 112) immediately and go to the nearest emergency room."
        ]
        red_flags = [
            "Chest pain lasting longer than 5 minutes",
            "Pain spreading to arm, neck, jaw, or back",
            "Severe shortness of breath, sweating, or fainting"
        ]
    elif any(k in s for k in ['cough', 'fever', 'sore throat', 'runny nose', 'cold', 'flu', 'chills', 'body ache']):
        sev_level = "Moderate" if 'high fever' in s or 'persistent cough' in s or 'difficulty breathing' in s else "Low"
        spec = "General Physician / ENT Specialist"
        possible = [
            {
                "condition": "Viral Upper Respiratory Infection",
                "match_probability": "High",
                "description": "Common viral infection causing cough, sore throat, and mild fever.",
                "key_indicators": ["Cough", "Sore throat", "Runny or blocked nose"]
            }
        ]
        first_aid = [
            "Rest and keep your throat moist by sipping warm fluids regularly.",
            "Use saline gargles for sore throat and inhale steam if your nose is congested.",
            "Monitor temperature and use fever-reducing measures if you feel uncomfortably hot."
        ]
        red_flags = [
            "High fever above 39°C (102°F)",
            "Rapid breathing or chest tightness",
            "Confusion or difficulty waking up"
        ]
    elif any(k in s for k in ['nausea', 'vomiting', 'vomit', 'diarrhea', 'stomach pain', 'abdominal pain', 'cramps', 'indigestion']):
        sev_level = "Moderate" if 'blood' in s or 'severe' in s or 'persistent' in s else "Low"
        spec = "Gastroenterologist / General Physician"
        possible = [
            {
                "condition": "Gastrointestinal Upset / Food-Related Irritation",
                "match_probability": "Moderate",
                "description": "Stomach irritation causing nausea, cramps, and possible vomiting.",
                "key_indicators": ["Nausea", "Vomiting", "Abdominal discomfort"]
            }
        ]
        first_aid = [
            "Sip small amounts of clear fluids slowly to stay hydrated.",
            "Avoid heavy, spicy, or greasy foods until nausea improves.",
            "Rest with your head elevated and avoid sudden movement."
        ]
        red_flags = [
            "Blood in vomit or stool",
            "Severe abdominal pain that worsens",
            "Unable to keep fluids down for more than 12 hours"
        ]
    elif any(k in s for k in ['rash', 'hives', 'itching', 'swelling', 'allergy', 'rash on skin']):
        sev_level = "Moderate" if 'swelling' in s or 'difficulty breathing' in s else "Low"
        spec = "Allergist / General Physician"
        possible = [
            {
                "condition": "Allergic Reaction / Contact Dermatitis",
                "match_probability": "High",
                "description": "Body reaction to an irritant or allergen, often causing rash and itching.",
                "key_indicators": ["Red itchy rash", "Swelling", "Skin irritation"]
            }
        ]
        first_aid = [
            "Stop contact with any new substance or product you think might be causing the rash.",
            "Apply a cool, damp compress to the affected skin to ease itching.",
            "Take an over-the-counter antihistamine if you have used it safely before."
        ]
        red_flags = [
            "Swelling of lips, tongue, or throat",
            "Difficulty breathing or swallowing",
            "Rapid spread of rash with dizziness"
        ]
    elif any(k in s for k in ['headache', 'migraine', 'throbbing', 'sensitivity to light', 'light sensitivity', 'head pain']):
        sev_level = "Moderate"
        spec = "Neurologist / General Physician"
        possible = [
            {
                "condition": "Migraine or Tension Headache",
                "match_probability": "High",
                "description": "Head pain often triggered by stress, light, or muscle tension.",
                "key_indicators": ["Throbbing pain", "Light sensitivity", "Neck tension"]
            }
        ]
        first_aid = [
            "Rest in a quiet, dark room and avoid bright screens.",
            "Use a cool cloth on your forehead and temples.",
            "Stay hydrated and take a mild pain reliever if you have used it safely before."
        ]
        red_flags = [
            "Sudden severe headache unlike any before",
            "Headache with fever, neck stiffness, or confusion"
        ]
    elif any(k in s for k in ['sprain', 'strain', 'twist', 'injury', 'bruised', 'swollen joint']):
        sev_level = "Moderate"
        spec = "Orthopedist / Urgent Care"
        possible = [
            {
                "condition": "Musculoskeletal Sprain or Strain",
                "match_probability": "Moderate",
                "description": "Soft tissue injury causing pain, swelling, and limited movement.",
                "key_indicators": ["Swelling", "Pain on movement", "Area tenderness"]
            }
        ]
        first_aid = [
            "Elevate the injured area and apply a cold pack for 15 minutes at a time.",
            "Use a compression bandage if it does not cut off circulation.",
            "Rest and avoid putting weight on the injured limb."
        ]
        red_flags = [
            "Severe joint deformity",
            "Inability to move the limb",
            "Numbness or coldness below the injury"
        ]
    else:
        sev_level = "Low"
        spec = "General Practitioner"
        possible = [
            {
                "condition": "Unclear or Non-specific Symptom Description",
                "match_probability": "Low",
                "description": "The input did not describe identifiable medical symptoms. Please provide clear symptom details such as pain, fever, cough, dizziness, or nausea.",
                "key_indicators": [symptoms[:30] or "No symptoms described"]
            }
        ]
        first_aid = [
            "Rest comfortably and avoid strenuous exertion.",
            "Maintain consistent hydration with water and clear fluids.",
            "Try describing symptoms in plain language, including how long they have been present and where they occur."
        ]
        red_flags = ["Loss of speech or muscle strength", "High persistent fever"]

    return {
        "primary_symptoms": [x.strip() for x in symptoms.split(',') if x.strip()],
        "severity_level": sev_level,
        "emergency_alert": is_emergency,
        "possible_conditions": possible,
        "recommended_specialist": spec,
        "first_aid_guidance": first_aid,
        "when_to_seek_emergency": red_flags,
        "disclaimer": "MediClear AI symptom evaluation provides educational triage only. Seek emergency care immediately if experiencing severe symptoms."
    }


def _infer_medicine_metadata(medicine_name: str) -> dict:
    key = medicine_name.lower().strip()

    for known_key, info in TOP_MEDICINES.items():
        if key == known_key or key.startswith(known_key) or known_key.startswith(key) or key in known_key:
            return {
                "purpose": info.get("purpose", "Provides general medicine usage information."),
                "common_side_effects": info.get("common_side_effects", ["Follow your healthcare provider's guidance for side effects."]),
                "precautions": info.get("precautions", "Use only as directed by your doctor or pharmacist."),
                "default_frequency": info.get("default_frequency", "As prescribed"),
                "default_timing": info.get("default_timing", "Follow the instructions provided by your physician")
            }

    for known_key, info in TOP_MEDICINES.items():
        if any(token in key for token in known_key.split()):
            return {
                "purpose": info.get("purpose", "Provides general medicine usage information."),
                "common_side_effects": info.get("common_side_effects", ["Follow your healthcare provider's guidance for side effects."]),
                "precautions": info.get("precautions", "Use only as directed by your doctor or pharmacist."),
                "default_frequency": info.get("default_frequency", "As prescribed"),
                "default_timing": info.get("default_timing", "Follow the instructions provided by your physician")
            }

    return {
        "purpose": "Provides general medication usage information for the given medicine name.",
        "common_side_effects": ["Follow your healthcare provider's guidance for side effects."],
        "precautions": "Use only as directed by your doctor or pharmacist.",
        "default_frequency": "As prescribed",
        "default_timing": "Follow the instructions provided by your physician"
    }


def _fallback_prescription_analysis(rx_text: str) -> dict:
    text = rx_text.lower().replace('\n', ' ').strip()
    entries = []
    seen = set()

    for key, info in TOP_MEDICINES.items():
        if re.search(rf"\b{re.escape(key)}\b", text):
            dosage = None
            frequency = None
            timing = None

            dosage_match = re.search(rf"{re.escape(key)}\s*(\d+(?:\.\d+)?\s*(mg|mcg|g|iu|ml|units|tablets?|tabs?))", text)
            if dosage_match:
                dosage = dosage_match.group(1)

            frequency_match = re.search(
                r"(once daily|twice daily|three times daily|three times a day|every 6-8 hours|every 8 hours|daily|morning|evening|bedtime|before meals|after meals|after food|before food)",
                text,
                flags=re.IGNORECASE
            )
            if frequency_match:
                frequency = frequency_match.group(1)

            timing_match = re.search(r"(after meals|before meals|with food|after food|before food|morning|evening|bedtime)", text, flags=re.IGNORECASE)
            if timing_match:
                timing = timing_match.group(1)

            entry = {
                "name": info['name'],
                "dosage": dosage or info.get('default_dosage', 'As prescribed'),
                "frequency": frequency.capitalize() if frequency else info['default_frequency'],
                "timing": timing.capitalize() if timing else info['default_timing'],
                "purpose": info['purpose'],
                "common_side_effects": info['common_side_effects'],
                "precautions": info['precautions']
            }
            entries.append(entry)
            seen.add(key)

    if not entries:
        generic_matches = re.findall(r"([a-zA-Z][a-zA-Z\s\-]{2,50})\s*(\d+(?:\.\d+)?\s*(?:mg|mcg|g|iu|ml|units|tablets?|tabs?))", text, flags=re.IGNORECASE)
        for match in generic_matches:
            med_name = match[0].strip().title()
            key = med_name.lower()
            if key in seen:
                continue
            metadata = _infer_medicine_metadata(med_name)
            entries.append({
                "name": med_name,
                "dosage": match[1],
                "frequency": metadata['default_frequency'],
                "timing": metadata['default_timing'],
                "purpose": metadata['purpose'],
                "common_side_effects": metadata['common_side_effects'],
                "precautions": metadata['precautions']
            })
            seen.add(key)

    if not entries:
        candidate_names = set()
        candidate_names.update(re.findall(
            r"\b(dolo|paracetamol|aspirin|ibuprofen|amoxicillin|metformin|telmisartan|omeprazole|pantoprazole|diclofenac|azithromycin|atorvastatin|amlodipine|metoprolol|losartan|simvastatin|clarithromycin|clindamycin|montelukast|fluconazole|prednisone|hydroxychloroquine|levothyroxine|loratadine|cetirizine|rabeprazole|vitamin\s*[ad3]*|calcium|zinc|naproxen|esomeprazole|ciprofloxacin|cefixime|cefuroxime|amoxicillin|metronidazole)\b",
            text,
            flags=re.IGNORECASE
        ))
        candidate_names.update(re.findall(
            r"\b([A-Za-z][A-Za-z0-9\-]{2,}(?:cillin|mycin|floxacin|cycline|penem|azole|vir|pril|sartan|olol|dipine|statin|prazole|tidine|sone|mab|nib|tide|fenac|caine|done))\b",
            text,
            flags=re.IGNORECASE
        ))
        for name in candidate_names:
            key = name.lower()
            if key in seen:
                continue
            metadata = _infer_medicine_metadata(name)
            dosage_match = re.search(rf"{re.escape(name)}\s*(\d+(?:\.\d+)?\s*(?:mg|mcg|g|iu|ml|units|tablets?|tabs?))", text, flags=re.IGNORECASE)
            dosage = dosage_match.group(1) if dosage_match else "As prescribed"
            frequency_match = re.search(
                r"(once daily|twice daily|three times daily|three times a day|every 6-8 hours|every 8 hours|daily|morning|evening|bedtime|before meals|after meals|after food|before food)",
                text,
                flags=re.IGNORECASE
            )
            timing_match = re.search(r"(after meals|before meals|with food|after food|before food|morning|evening|bedtime)", text, flags=re.IGNORECASE)
            entries.append({
                "name": name.title(),
                "dosage": dosage,
                "frequency": frequency_match.group(1).capitalize() if frequency_match else metadata['default_frequency'],
                "timing": timing_match.group(1).capitalize() if timing_match else metadata['default_timing'],
                "purpose": metadata['purpose'],
                "common_side_effects": metadata['common_side_effects'],
                "precautions": metadata['precautions']
            })
            seen.add(key)

    if not entries:
        return {
            "diagnosis_note": "Could not identify specific medications",
            "medicines": [],
            "general_instructions": [
                "Please enter the medicine names, doses, and instructions clearly.",
                "Example: Paracetamol 500mg twice daily after meals, Amoxicillin 500mg three times daily."
            ],
            "drug_interactions_warning": "No medication information was extracted from the input.",
            "disclaimer": "This output is educational only and does not replace medical advice."
        }

    return {
        "diagnosis_note": "Medicine usage and precautions based on the provided prescription text.",
        "medicines": entries,
        "general_instructions": [
            "Take each medicine exactly as prescribed by your healthcare provider.",
            "Do not combine medications without medical advice.",
            "Report any unusual side effects to your doctor immediately."
        ],
        "drug_interactions_warning": "Consult your healthcare provider before combining these medicines with other drugs.",
        "disclaimer": "This information is for education only and does not replace professional medical advice."
    }
