"""
Script to extract trained models and preprocessing components from the notebook
Run this after training your models in the notebook
"""

import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Embedding, LSTM, Dense, Dropout, Concatenate
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
import pickle
import os

def extract_models_from_notebook():
    """Extract models and preprocessing components from notebook training"""
    
    # Create models directory
    models_dir = './ml_models'
    os.makedirs(models_dir, exist_ok=True)
    
    # Load your dataset (adjust path as needed)
    try:
        data = pd.read_csv('../fake_review_detection.ipynb')
        print("Dataset loaded successfully")
    except:
        print("Could not load dataset. Using sample data for demonstration.")
        # Create sample data for demonstration
        data = pd.DataFrame({
            'review_text': [
                'This product is amazing! I love it so much.',
                'Terrible product, waste of money.',
                'Good quality, would recommend.',
                'Excellent service and fast delivery.',
                'Not worth the price at all.'
            ],
            'timestamp': pd.date_range('2024-01-01', periods=5),
            'ip_address': ['192.168.1.1', '192.168.1.2', '192.168.1.3', '192.168.1.4', '192.168.1.5'],
            'label': ['real', 'real', 'fake', 'real', 'fake'],
            'burst_reviews': [False, False, True, False, False],
            'copy_paste_review': [False, False, False, True, False],
            'likely_bot': [False, False, False, False, True]
        })
    
    # Preprocessing steps from notebook
    print("Preprocessing data...")
    
    # Convert timestamp to datetime
    data["timestamp"] = pd.to_datetime(data["timestamp"])
    
    # Time difference between consecutive reviews
    data["time_diff"] = data["timestamp"].diff().dt.seconds.fillna(0)
    
    # IP frequency count
    data["ip_count"] = data.groupby("ip_address")["ip_address"].transform("count")
    
    # Scale features
    scaler = MinMaxScaler()
    data[["time_diff", "ip_count"]] = scaler.fit_transform(data[["time_diff", "ip_count"]])
    
    # Text preprocessing
    length = 0
    for val in data["review_text"]:
        length = max(length, len(val.split()))
    
    tokenizer = Tokenizer()
    tokenizer.fit_on_texts(data["review_text"])
    X_text = pad_sequences(tokenizer.texts_to_sequences(data["review_text"]), maxlen=length)
    
    X_extra = np.array(data[["time_diff", "ip_count"]])
    
    # Prepare labels
    data['label'] = data['label'].astype(str)
    for val in range(len(data['label'])):
        if data["label"][val] == 'fake':
            data.loc[val, "label"] = 1
        else:
            data.loc[val, "label"] = 0
    y = np.array(data["label"], dtype='int64')
    
    # Split data
    X_train_text, X_test_text, X_train_extra, X_test_extra, y_train, y_test = train_test_split(
        X_text, X_extra, y, test_size=0.2, random_state=42)
    
    print("Training models...")
    
    # Train fake review detection model
    text_input = tf.keras.layers.Input(shape=(length,))
    embedding_layer = Embedding(input_dim=len(tokenizer.word_index)+1, output_dim=50)(text_input)
    lstm_layer = LSTM(64)(embedding_layer)
    
    extra_input = tf.keras.layers.Input(shape=(2,))
    merged = Concatenate()([lstm_layer, extra_input])
    
    dense1 = Dense(64, activation="relu")(merged)
    dropout1 = Dropout(0.3)(dense1)
    output_layer = Dense(1, activation="sigmoid")(dropout1)
    
    model = tf.keras.Model(inputs=[text_input, extra_input], outputs=output_layer)
    model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
    
    # Train for a few epochs
    model.fit([X_train_text, X_train_extra], y_train, epochs=2, batch_size=4, validation_split=0.2)
    
    # Save the model
    model.save(os.path.join(models_dir, 'fake_review.h5'))
    print("Saved fake_review.h5")
    
    # Train burst review detection model
    data['burst_reviews'] = data['burst_reviews'].astype(str)
    for val in range(len(data['burst_reviews'])):
        if data["burst_reviews"][val] == 'True':
            data.loc[val, "burst_reviews"] = 1
        else:
            data.loc[val, "burst_reviews"] = 0
    y_br = np.array(data["burst_reviews"], dtype='int64')
    
    X_train_text, X_test_text, X_train_extra, X_test_extra, y_train, y_test = train_test_split(
        X_text, X_extra, y_br, test_size=0.2, random_state=42)
    
    model_br = tf.keras.Model(inputs=[text_input, extra_input], outputs=output_layer)
    model_br.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
    
    model_br.fit([X_train_text, X_train_extra], y_train, epochs=2, batch_size=4, validation_split=0.2)
    model_br.save(os.path.join(models_dir, 'burst_review.h5'))
    print("Saved burst_review.h5")
    
    # Train copy-paste review detection model
    data['copy_paste_review'] = data['copy_paste_review'].astype(str)
    for val in range(len(data['copy_paste_review'])):
        if data["copy_paste_review"][val] == 'True':
            data.loc[val, "copy_paste_review"] = 1
        else:
            data.loc[val, "copy_paste_review"] = 0
    y_cpr = np.array(data["copy_paste_review"], dtype='int64')
    
    X_train_text, X_test_text, X_train_extra, X_test_extra, y_train, y_test = train_test_split(
        X_text, X_extra, y_cpr, test_size=0.2, random_state=42)
    
    model_cpr = tf.keras.Model(inputs=[text_input, extra_input], outputs=output_layer)
    model_cpr.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
    
    model_cpr.fit([X_train_text, X_train_extra], y_train, epochs=2, batch_size=4, validation_split=0.2)
    model_cpr.save(os.path.join(models_dir, 'copy-paste_review.h5'))
    print("Saved copy-paste_review.h5")
    
    # Train bot detection model
    data['likely_bot'] = data['likely_bot'].astype(str)
    for val in range(len(data['likely_bot'])):
        if data["likely_bot"][val] == 'True':
            data.loc[val, "likely_bot"] = 1
        else:
            data.loc[val, "likely_bot"] = 0
    y_lb = np.array(data["likely_bot"], dtype='int64')
    
    X_train_text, X_test_text, X_train_extra, X_test_extra, y_train, y_test = train_test_split(
        X_text, X_extra, y_lb, test_size=0.2, random_state=42)
    
    model_lb = tf.keras.Model(inputs=[text_input, extra_input], outputs=output_layer)
    model_lb.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
    
    model_lb.fit([X_train_text, X_train_extra], y_train, epochs=2, batch_size=4, validation_split=0.2)
    model_lb.save(os.path.join(models_dir, 'likely_bot.h5'))
    print("Saved likely_bot.h5")
    
    # Save preprocessing components
    print("Saving preprocessing components...")
    
    # Save tokenizer
    with open(os.path.join(models_dir, 'tokenizer.pkl'), 'wb') as f:
        pickle.dump(tokenizer, f)
    print("Saved tokenizer.pkl")
    
    # Save scaler
    with open(os.path.join(models_dir, 'scaler.pkl'), 'wb') as f:
        pickle.dump(scaler, f)
    print("Saved scaler.pkl")
    
    # Save max_length
    with open(os.path.join(models_dir, 'max_length.txt'), 'w') as f:
        f.write(str(length))
    print("Saved max_length.txt")
    
    print(f"All models and components saved to {models_dir}/")
    print("You can now run the Flask API server!")

if __name__ == "__main__":
    extract_models_from_notebook() 