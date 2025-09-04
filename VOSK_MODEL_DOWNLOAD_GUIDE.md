# 🎯 Vosk Model Download Guide

## 📥 **Correct Vosk Model Download Links**

### **English Model (Recommended)**
- **Download Link**: https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip
- **Alternative Link**: https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.tar.gz
- **Size**: ~40 MB
- **Accuracy**: Good for general speech recognition

### **Hindi Model (Optional)**
- **Download Link**: https://alphacephei.com/vosk/models/vosk-model-small-hi-0.22.zip
- **Alternative Link**: https://alphacephei.com/vosk/models/vosk-model-small-hi-0.22.tar.gz
- **Size**: ~42 MB

## 🛠️ **Installation Steps**

### **Step 1: Download Models**
```bash
# Navigate to public/models directory
cd public/models

# Download English model (choose ZIP for easier extraction)
curl -O https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip

# Download Hindi model (optional)
curl -O https://alphacephei.com/vosk/models/vosk-model-small-hi-0.22.zip
```

### **Step 2: Extract Models**
```bash
# Extract English model
unzip vosk-model-small-en-us-0.15.zip

# Extract Hindi model (if downloaded)
unzip vosk-model-small-hi-0.22.zip

# Remove zip files after extraction
rm *.zip
```

### **Step 3: Verify Structure**
Your `public/models/` directory should look like:
```
public/models/
├── vosk-model-small-en-us-0.15/
│   ├── am/
│   ├── conf/
│   ├── graph/
│   ├── ivector/
│   ├── final.mdl
│   ├── mfcc.conf
│   ├── model.conf
│   └── README
└── vosk-model-small-hi-0.22/
    ├── am/
    ├── conf/
    ├── graph/
    ├── ivector/
    ├── final.mdl
    ├── mfcc.conf
    ├── model.conf
    └── README
```

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Unrecognized archive format"**
**Cause**: Model files are corrupted or incomplete
**Solution**: 
1. Delete existing model directories
2. Download fresh copies using the links above
3. Ensure complete extraction

### **Issue 2: Models not loading**
**Cause**: Static file serving issues
**Solution**:
1. Restart your development server: `npm start`
2. Check console for any 404 errors
3. Run diagnostics in the app

### **Issue 3: Network download issues**
**Alternative method**: Manual download
1. Open the download links in your browser
2. Save to `Downloads` folder
3. Extract manually to `public/models/`

## 💻 **PowerShell Commands for Windows**

If you prefer using PowerShell (Windows):

```powershell
# Navigate to project directory
cd "D:\nlp_emotion_detection_project\public\models"

# Download English model
Invoke-WebRequest -Uri "https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip" -OutFile "vosk-model-small-en-us-0.15.zip"

# Download Hindi model (optional)
Invoke-WebRequest -Uri "https://alphacephei.com/vosk/models/vosk-model-small-hi-0.22.zip" -OutFile "vosk-model-small-hi-0.22.zip"

# Extract using built-in PowerShell
Expand-Archive -Path "vosk-model-small-en-us-0.15.zip" -DestinationPath "."
Expand-Archive -Path "vosk-model-small-hi-0.22.zip" -DestinationPath "."

# Clean up zip files
Remove-Item "*.zip"
```

## 🔧 **Testing After Installation**

1. Restart your development server: `npm start`
2. Open your app at `http://localhost:3001`
3. Go to **"🔧 Vosk Diagnostics"** tab
4. Click **"🚀 Run Vosk Diagnostics"**
5. Check results and follow any recommendations

## 📚 **Alternative Models** (if you need better accuracy)

### **Larger English Models** (better accuracy, larger size):
- **Medium**: https://alphacephei.com/vosk/models/vosk-model-en-us-0.22.zip (~1.8 GB)
- **Large**: https://alphacephei.com/vosk/models/vosk-model-en-us-0.22-lgraph.zip (~128 MB)

### **Other Languages**:
- **German**: https://alphacephei.com/vosk/models/vosk-model-small-de-0.15.zip
- **French**: https://alphacephei.com/vosk/models/vosk-model-small-fr-0.22.zip
- **Spanish**: https://alphacephei.com/vosk/models/vosk-model-small-es-0.42.zip

## ⚡ **Quick Fix Command** (Copy & Paste)

```bash
cd public/models && \
rm -rf vosk-model-* && \
curl -O https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip && \
unzip vosk-model-small-en-us-0.15.zip && \
rm vosk-model-small-en-us-0.15.zip && \
echo "✅ Vosk model installed successfully!"
```

---

💡 **Pro Tip**: The ZIP versions are usually more reliable than TAR.GZ versions for web applications. Always prefer downloading the .zip files when available!
