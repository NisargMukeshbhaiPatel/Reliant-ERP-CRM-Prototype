# Reliant-ERP-CRM-Prototype
**The application is already deployed on the cloud and can be accessed through the provided URL. By default, you will land on the customer-facing interface used for submitting enquiries.
To switch to the CRM (management) side, click the Login button located on the left-hand side of the page and sign in with the following credentials:
Email: manager@example.com
Password: 12345678 **

**https://reliant-crm.netlify.app**


🏃 Run the App Locally (Step‑by‑Step)
The commands below are the same for macOS, Linux, and Windows (PowerShell).
Open a Terminal / Command Prompt
Windows: Press Win → type PowerShell → Enter
macOS: Press Cmd+Space → type Terminal → Enter
Linux: Open your preferred terminal

Navigate to the project folder
**cd path/to/your/Reliant-ERP-CRM-Prototype**

Install dependencies inside the project folder(this downloads required libraries)
**npm install**

Start the development server
**npm run dev**


Open the app
**Visit: http://localhost:3000** in your browser
Keep the terminal window open while using the app (it shows logs)

**🤖 AI Components**
The system integrates AI at multiple stages to improve efficiency and reliability:
**Quotation Predictor (Scikit-learn + FastAPI)**
Role: Predicts quotation prices instantly based on product type, size, colour, and quantity.
Benefit: Provides sales staff with a quick, data-driven price estimate, cutting down manual calculation time.
**LLM Fallback (GPT-4-mini)**
Role: If the main prediction model is unavailable, the system uses a large language model to suggest approximate prices based on historical patterns and rules.
Benefit: Ensures the system always provides a price suggestion, maintaining business continuity even if the ML predictor fails.
**Quotation Summary (LLM – GPT-4-mini)**
Role: Converts structured quotation data into clear, human-readable summaries.
Example: “Quotation created for John Smith: 4 flush sash windows, estimated £1520.75.”
Benefit: Improves communication between sales staff and management by simplifying technical details.
✨ Together, these AI components make the system fast, reliable, and fault-tolerant — ensuring quotations are always generated, predicted, and clearly presented.

