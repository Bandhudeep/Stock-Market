# Stock-Market
AI-Powered Stock Analysis Dashboard

This project is a modern, AI-powered stock analysis dashboard built with React, TypeScript, Tailwind CSS, React Query, and Chart.js. 
It allows users to search for stocks, view real-time quotes, historical data, AI-driven insights, sentiment analysis, and get news and recommendations—all in a sleek, responsive UI.

Features

- Stock Search – Find stocks by name or ticker symbol.
- Stock Chart – Visualize historical price trends using customizable timeframes.
- Real-Time Quotes – View up-to-date stock prices, volume, and changes.
- AI-Based Insights – Includes summary, technical analysis, sentiment analysis, and risk assessment powered by AI agents.
- Latest News – See relevant news articles for the selected stock.
- Stock Recommendations – Discover similar stocks based on AI-generated suggestions.
- Responsive UI – Tailwind CSS-powered design optimized for desktop and mobile.

Project Structure

Components

AgentSystem.tsx  
Displays AI-generated stock analysis across multiple tabs: Summary, Technical, Sentiment, and Risk.

StockChart.tsx  
Line chart for visualizing historical stock price trends using Chart.js.

StockInfo.tsx  
Displays real-time stock metrics like price, volume, and price change indicators.

StockNews.tsx  
Lists recent news articles related to the selected stock.

StockRecommendations.tsx  
Suggests similar stocks for investment opportunities.

StockSearch.tsx  
A search bar that enables users to search and select stocks with auto-complete dropdown.

API Logic

api.ts  
Centralized API methods using Axios to interact with a stock market API or mock data (Alpha Vantage-style).

App Configuration

App.tsx  
Root component managing selected stock state, rendering subcomponents based on user input.

vite.config.ts / vite-env.d.ts  
Configuration for building and serving the app with Vite.

Styles & Configuration

tailwind.config.js / postcss.config.js / index.css  
Styling configuration using Tailwind CSS.

tsconfig.json  
TypeScript compiler options and settings.

eslint.config.js  
ESLint setup for code quality and consistency.

Other

index.html  
Root HTML template.

package.json / package-lock.json  
Project dependencies, scripts, and metadata.

Installation

1. Clone the repository  
git clone   
cd ai-stock-dashboard

2. Install dependencies  
npm install

3. Run the development server  
npm run dev

4. Build for production  
npm run build

5. Preview production build  
npm run preview

Technologies Used

- React + TypeScript
- React Query – for efficient data fetching and caching
- Chart.js – for data visualization
- Axios – for API calls
- Tailwind CSS – for styling
- Lucide Icons – for UI icons
- Vite – for fast builds and development server

Environment Setup

To use live APIs, configure your .env file as follows:  
VITE_API_KEY=your_api_key_here

If you're using mock data (default), no API key is necessary.

License

This project is licensed under the MIT License.

Acknowledgments

- Alpha Vantage for data inspiration
- React Query for state management
- Tailwind CSS for styling utilities
- Chart.js for beautiful charting
