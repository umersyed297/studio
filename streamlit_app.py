
import streamlit as st
import pandas as pd
import os
from datetime import datetime
import requests
from PIL import Image
import io

# Set up folder for uploaded images
UPLOAD_FOLDER = "images"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# File to store observations
OBSERVATION_FILE = "observations.csv"

# Load or create the observation dataset
def load_observations():
    if os.path.exists(OBSERVATION_FILE):
        return pd.read_csv(OBSERVATION_FILE)
    else:
        df = pd.DataFrame(columns=["observation_id", "species_name", "date_observed", "location", "image_url", "notes"])
        df.to_csv(OBSERVATION_FILE, index=False)
        return df

def save_observation(entry):
    df = load_observations()
    df = pd.concat([df, pd.DataFrame([entry])], ignore_index=True)
    df.to_csv(OBSERVATION_FILE, index=False)

# -------- Streamlit UI --------
st.set_page_config(page_title="BioScout Islamabad")
st.title("🌿 BioScout Islamabad")

# Sidebar Tabs
menu = ["Species Observation Hub", "AI-Powered Species ID", "Q&A with AI"]
choice = st.sidebar.radio("Go to", menu)

if choice == "Species Observation Hub":
    st.subheader("📌 Submit a Biodiversity Observation")

    with st.form(key="observation_form"):
        species_name = st.text_input("Species Name (common or scientific)")
        date_observed = st.date_input("Date of Observation", value=datetime.today())
        location = st.text_input("Location (e.g., Rawal Lake, Margalla Hills)")
        image = st.file_uploader("Upload an Image", type=["jpg", "jpeg", "png"])
        notes = st.text_area("Additional Notes")
        submit = st.form_submit_button("Submit Observation")

    if submit:
        image_url = ""
        if image is not None:
            image_path = os.path.join(UPLOAD_FOLDER, image.name)
            with open(image_path, "wb") as f:
                f.write(image.getbuffer())
            image_url = image_path

        obs_entry = {
            "observation_id": len(load_observations()) + 1,
            "species_name": species_name,
            "date_observed": date_observed,
            "location": location,
            "image_url": image_url,
            "notes": notes
        }

        save_observation(obs_entry)
        st.success("✅ Observation submitted successfully!")

    st.markdown("---")
    st.subheader("📍 View Community Observations")
    df = load_observations()
    st.dataframe(df)

elif choice == "AI-Powered Species ID":
    st.subheader("🔍 AI Species Identifier (WAC API)")

    image = st.file_uploader("Upload an Image for ID Suggestion", type=["jpg", "jpeg", "png"])

    if image:
        st.image(image, caption="Uploaded Image", use_column_width=True)
        st.markdown("### 🤖 AI Suggestion")

        try:
            img_bytes = image.read()
            files = {"image": ("image.jpg", img_bytes, image.type)}

            response = requests.post(
                "http://localhost:3001/api/v1/classify",
                files=files
            )

            if response.status_code == 200:
                predictions = response.json().get("predictions", {}).get("predictions", [])
                if predictions:
                    top_prediction = max(predictions, key=lambda x: x["probability"])
                    st.success(f"Suggested Species: **{top_prediction['className']}** with confidence {top_prediction['probability']*100:.2f}%")
                else:
                    st.warning("No species suggestion found.")
            else:
                st.error(f"Failed to identify species (status {response.status_code}).")

        except Exception as e:
            st.error(f"Error: {e}")

elif choice == "Q&A with AI":
    st.subheader("💬 Ask the AI about Biodiversity")

    question = st.text_input("Ask a question (e.g., What birds are common in Margalla Hills?)")

    if question:
        try:
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    # Ensure your OpenRouter API key is set in your Streamlit secrets.
                    # For local development, create a file .streamlit/secrets.toml in your project root with:
                    # openrouter_api_key = "your_actual_key_here"
                    "Authorization": f"Bearer {st.secrets['openrouter_api_key']}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "openai/gpt-3.5-turbo",
                    "messages": [
                        {"role": "system", "content": "You are a helpful assistant knowledgeable about biodiversity in Pakistan."},
                        {"role": "user", "content": question}
                    ]
                }
            )

            if response.status_code == 200:
                answer = response.json()["choices"][0]["message"]["content"]
                st.success(answer)
            else:
                st.error(f"Failed to get a response from OpenRouter API. Status code: {response.status_code}")

        except Exception as e:
            st.error(f"Error fetching AI response: {e}")
