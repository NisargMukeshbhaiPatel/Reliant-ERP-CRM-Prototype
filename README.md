# Reliant-ERP-CRM-Prototype
The application is already deployed on the cloud ☁️and can be accessed through the provided URL. By default, you will land on the customer-facing interface used for submitting enquiries.<br>
To switch to the CRM (management) side, click the Login button located on the left-hand side of the page and sign in with the following credentials: <br>
Email: manager@example.com <br>
Password: 12345678 <br> 

**https://reliant-crm.netlify.app**


## 🏃 Run the App Locally (Step‑by‑Step)
The commands below are the same for macOS, Linux, and Windows (PowerShell). <br>
- Open a Terminal / Command Prompt <br>
- Windows: Press Win → type PowerShell → Enter <br>
- macOS: Press Cmd+Space → type Terminal → Enter <br>
- Linux: Open your preferred terminal 

 **Navigate to the project folder**
```bash
cd path/to/your/Reliant-ERP-CRM-Prototype
```
**Install dependencies inside the project folder(this downloads are required for libraries)**
```bash
npm install
```
**Start the development server**
```bash
npm run dev
```
**Opening  the app**
**Visit: http://localhost:3000** in your browser <br>
Keep the terminal window open while using the app (it shows logs)

## 🤖 AI Components
The system integrates AI at multiple stages to improve efficiency and reliability:<br>
**Quotation Predictor (Scikit-learn + FastAPI)** <br>
Role: Predicts quotation prices instantly based on product type, size, colour, and quantity. <br>
Benefit: Provides sales staff with a quick, data-driven price estimate, cutting down manual calculation time.<br>

**LLM Fallback (GPT-4-mini)** <br>
Role: If the main prediction model is unavailable, the system uses a large language model to suggest approximate prices based on historical patterns and rules.<br>
Benefit: Ensures the system always provides a price suggestion, maintaining business continuity even if the ML predictor fails.<br>

**Quotation Summary (LLM – GPT-4-mini)** <br>
Role: Converts structured quotation data into clear, human-readable summaries.<br>
Example: “Quotation created for John Smith: 4 flush sash windows, estimated £1520.75.” <br>
Benefit: Improves communication between sales staff and management by simplifying technical details.<br>

✨ Together, these AI components make the system fast, reliable, and fault-tolerant — ensuring quotations are always generated, predicted, and clearly presented. <br> 

## Application demo Video 📹 :

https://drive.google.com/drive/folders/14ZcaforB9FoQHSv8lsE6Fwqtbk9aYWUu?usp=share_link


