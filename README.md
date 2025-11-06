# size.ai

**AI-Powered SIEM & XDR Infrastructure Sizing Calculator**

A modern, professional web application for calculating Security Information and Event Management (SIEM) and Extended Detection and Response (XDR) infrastructure requirements. Features real-time calculations, AI-powered insights, and comprehensive reporting.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/react-18.2.0-61dafb.svg)
![FastAPI](https://img.shields.io/badge/fastapi-0.100+-009688.svg)

---

## ✨ Features

### 📊 Core Functionality
- **Device Inventory Management**: Configure various device types with customizable EPS (Events Per Second) values
  - Endpoints: Windows, Linux, macOS workstations
  - Servers: Windows, Linux, Database, Application servers
  - Network: Firewalls, Switches, Routers, Load Balancers, IDS/IPS
  - Security: SIEM Agents, EDR Agents, WAF
  - Cloud: AWS, Azure, GCP resources

- **Real-time Calculations**: Instant computation of:
  - Total/Peak EPS and event volumes
  - Daily, weekly, monthly, and yearly data volumes
  - Storage requirements with compression and replication factors
  - Infrastructure component sizing (CPU, RAM, Storage)

### 🎯 Advanced Features
- **Real-World Deployment Scenarios** ⭐ NEW: One-click templates for common SIEM deployments
  - 🏢 Fortune 500 Enterprise (20,840 devices)
  - ☁️ MSP/Cloud Provider (18,000 devices)
  - 🚀 Cloud-Native Startup (2,609 devices)
  - 🏦 Regulated Finance - PCI-DSS (7,010 devices)
  - 🏥 Healthcare - HIPAA (4,920 devices)
  - 🏭 Manufacturing & IoT (2,805 devices)
- **Growth Projections**: 3-year infrastructure forecast with customizable growth rates
- **Cost Estimation**: Detailed breakdown of hardware, storage, and network costs
- **Compliance Templates**: Pre-configured settings for PCI-DSS, HIPAA, GDPR, and SOC 2
- **High Availability Setup**: HA recommendations with RTO/RPO metrics
- **Architecture Recommendations**: Intelligent deployment topology suggestions
- **Hot/Cold Storage Split**: Optimize costs with storage tiering
- **Multi-Language Support**: Interface available in English, Spanish, French, and German
- **Configuration Import/Export**: Save and share configurations as JSON
- **Progressive Web App**: Install on desktop with offline capabilities

### 🤖 AI Integration
- **AI Assistant**: Natural language query interface for sizing insights
- Support for multiple AI providers (OpenAI, Anthropic)
- Context-aware recommendations based on your configuration

### 📄 Export & Reporting
- **PDF Report Generation**: Professional, detailed infrastructure reports
- **Configuration Export**: Save and share configurations as text files
- **Download Functionality**: Export results for offline analysis

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Beautiful, modern interface with blur effects
- **Dark Theme**: Easy on the eyes with carefully crafted color palette
- **Responsive Layout**: Works seamlessly on desktop and tablet devices
- **Smooth Animations**: Polished interactions with Framer Motion
- **Real-time Updates**: Instant feedback as you adjust parameters

---

## 🚀 Tech Stack

### Frontend
- **React 18.2** - Modern UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - High-quality React components
- **Framer Motion** - Animation library
- **Lucide React** - Beautiful icon set
- **jsPDF** - PDF generation
- **Sonner** - Toast notifications

### Backend
- **FastAPI** - Modern Python web framework
- **Python 3.11+** - Programming language
- **MongoDB** - NoSQL database
- **Uvicorn** - ASGI server

### Development Tools
- **Vite** - Fast build tool
- **ESLint** - Code linting
- **PostCSS** - CSS processing

---

## 📦 Installation

### Prerequisites
- **Node.js** 18+ and Yarn
- **Python** 3.11+
- **MongoDB** (if using backend features)

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

The backend API will be available at `http://localhost:8001`

### Environment Variables

**Frontend (.env)**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

**Backend (.env)**
```env
MONGO_URL=mongodb://localhost:27017/sizeai
```

---

## 🎮 Usage

### Basic Workflow

1. **Configure Device Inventory**
   - Expand device categories (Endpoints, Servers, Network, Security, Cloud)
   - Enter quantities for each device type
   - Adjust EPS values if needed (default values provided)

2. **Set Configuration Options**
   - Choose retention period (30-365 days or custom)
   - Select compliance template (optional)
   - Configure replication factor (1x-3x)
   - Set compression level (None, Standard, High)
   - Enable hot/cold storage split (optional)
   - Enable growth projections with annual growth rate

3. **View Results**
   - **Event Processing Summary**: Total EPS, Peak EPS, device count
   - **Data Volume**: Daily, weekly, monthly, yearly volumes
   - **Storage Requirements**: Total storage with compression/replication
   - **Infrastructure Components**: Hardware sizing recommendations
   - **Architecture Recommendation**: Deployment topology suggestion
   - **High Availability**: HA configuration and RTO/RPO metrics
   - **Growth Projections**: 3-year forecast (if enabled)
   - **Cost Estimation**: Infrastructure cost breakdown

4. **Get AI Insights** (Optional)
   - Open AI Assistant panel
   - Select AI provider and enter API key
   - Ask questions about sizing, optimization, or best practices

5. **Export Results**
   - Generate PDF report
   - Download configuration as text file

---

## 📁 Project Structure

```
size.ai/
├── frontend/
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── calculator/     # Calculator components
│   │   │   │   ├── AIAssistant.jsx
│   │   │   │   ├── ConfigurationPanel.jsx
│   │   │   │   ├── DeviceInventory.jsx
│   │   │   │   └── ResultsDashboard.jsx
│   │   │   ├── layout/         # Layout components
│   │   │   │   └── Header.jsx
│   │   │   └── ui/             # Shadcn UI components
│   │   ├── pages/
│   │   │   └── Calculator.jsx  # Main calculator page
│   │   ├── utils/
│   │   │   ├── calculations.js # Calculation logic
│   │   │   └── pdfGenerator.js # PDF generation
│   │   ├── App.js
│   │   ├── main.jsx
│   │   └── index.css           # Global styles & design system
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # Backend environment variables
└── README.md
```

---

## ⚙️ Configuration

### Device Types & Default EPS

| Category | Device Type | Default EPS |
|----------|-------------|-------------|
| **Endpoints** | Windows Workstations | 3 |
| | Linux Workstations | 2 |
| | macOS Workstations | 2 |
| **Servers** | Windows Servers | 20 |
| | Linux Servers | 15 |
| | Database Servers | 30 |
| | Application Servers | 25 |
| **Network** | Firewalls | 200 |
| | Switches | 50 |
| | Routers | 300 |
| | Load Balancers | 150 |
| | IDS/IPS Systems | 500 |
| **Security** | SIEM Agents | 5 |
| | EDR Agents | 15 |
| | Web Application Firewalls | 100 |
| **Cloud** | AWS Resources | 10 |
| | Azure Resources | 10 |
| | GCP Resources | 10 |

### Compliance Templates

| Template | Retention Period | Description |
|----------|-----------------|-------------|
| **PCI-DSS** | 90 days | Payment Card Industry standard |
| **HIPAA** | 365 days | Healthcare compliance |
| **GDPR** | 180 days | EU data protection |
| **SOC 2** | 365 days | Security auditing standard |

### Calculation Formulas

**Daily Data Volume**
```
dailyGB = (totalEPS × 86,400 seconds) / 125,000
```

**Storage Requirements**
```
totalStorage = dailyGB × retentionDays × compressionFactor × replicationFactor × indexingOverhead
```

**Peak EPS**
```
peakEPS = totalEPS × 1.3  // 30% buffer
```

---

## 🎨 Design System

### Color Palette (HSL)
```css
--background: 220 65% 4%        /* Deep blue-black */
--foreground: 220 15% 95%       /* Off-white */
--primary: 262 83% 58%          /* Purple */
--accent: 189 95% 55%           /* Cyan */
--secondary: 220 15% 15%        /* Dark gray */
--muted: 220 15% 25%            /* Medium gray */
--border: 220 15% 20%           /* Border color */
```

### Gradients
- **Primary**: Purple to blue
- **Accent**: Cyan to blue
- **Card**: Semi-transparent with backdrop blur

### Typography
- **Font Family**: Inter (sans-serif)
- **Heading Font**: System UI fonts

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and conventions
- Write clear commit messages
- Test your changes thoroughly
- Update documentation as needed

---

## 📝 API Documentation

### Calculation Engine

The core calculation logic is handled client-side in `src/utils/calculations.js`:

**Main Function**: `calculateInfrastructure(devices, configuration)`

**Returns**:
```javascript
{
  // Event Processing
  totalEPS: number,
  peakEPS: number,
  totalDevices: number,
  eventsPerDay: number,
  eventsPerMonth: number,
  
  // Data Volume
  dailyGB: number,
  weeklyTB: number,
  monthlyTB: number,
  yearlyTB: number,
  
  // Storage
  totalStorageTB: number,
  hotStorageGB: number,
  coldStorageGB: number,
  
  // Infrastructure
  infrastructure: {
    managementServer: {...},
    dataIndexer: {...},
    webConsole: {...},
    totalCPU: number,
    totalRAM: number,
    totalStorage: number
  },
  
  // Architecture
  architecture: {...},
  
  // Growth (if enabled)
  growthProjections: [...],
  
  // Costs
  costs: {
    hardwareMonthly: number,
    storageMonthly: number,
    networkMonthly: number,
    totalMonthly: number,
    totalAnnual: number
  },
  
  // Warnings & Recommendations
  warnings: {...}
}
```

---

## 🔒 Security Considerations

- API keys for AI services are stored client-side only
- No sensitive data is transmitted to backend
- All calculations performed client-side
- Configuration exports are plain text (no encryption)

**Important**: Do not commit API keys to version control. Use environment variables.

---

## 🐛 Known Issues & Limitations

- AI Assistant requires external API keys (OpenAI, Anthropic)
- PDF generation may have layout issues with very large data sets
- Mobile responsiveness is optimized for tablets and above
- Browser console may show warnings about missing icons (can be safely ignored)

---

## 🗺️ Roadmap

### Planned Features
- [ ] **Enhanced Visualizations**: Charts for data volume trends and device distribution
- [ ] **Multiple Saved Profiles**: Save and manage multiple configurations
- [ ] **Comparison Mode**: Compare different sizing scenarios side-by-side
- [ ] **Email Reports**: Send reports directly via email
- [ ] **Advanced Help System**: Tooltips and documentation modals
- [ ] **Input Validation**: Warnings for unrealistic values
- [ ] **JSON Import/Export**: Import configurations from JSON files
- [ ] **Cost Calculator Enhancements**: More detailed pricing models

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Authors

- **Development Team** - Initial work and ongoing maintenance

---

## 🙏 Acknowledgments

- **Shadcn/UI** for the beautiful component library
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the icon set
- **OpenAI & Anthropic** for AI capabilities
- **FastAPI** for the modern Python web framework

---

## 📞 Support

For support, please:
1. Check the [Issues](../../issues) page for existing problems
2. Create a new issue with detailed information
3. Provide screenshots if applicable
4. Include browser/environment details

---

## 📚 Additional Resources

- [SIEM Best Practices](https://www.sans.org/reading-room/whitepapers/logging/)
- [Infrastructure Sizing Guidelines](https://docs.splunk.com/Documentation/Splunk/latest/Capacity/Summaryofperformancerecommendations)
- [Compliance Standards Overview](https://www.csoonline.com/article/3410278/compliance-overview.html)

---

<div align="center">
  <strong>Built with ❤️ for Security Operations Teams</strong>
  <br>
  <sub>Making infrastructure sizing simple, accurate, and intelligent</sub>
</div>
