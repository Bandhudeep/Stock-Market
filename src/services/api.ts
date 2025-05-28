import axios from 'axios';

// Alpha Vantage API key - in a real app, this would be stored in an environment variable
// For this demo, we'll use a placeholder key
const API_KEY = '0O1INRO6FETJ37JH';
const BASE_URL = 'https://www.alphavantage.co/query';

// Mock data for development - in a real app, we would use the actual API
// This is to avoid hitting API rate limits during development
const useMockData = true;

// Stock search
export const searchStocks = async (query: string) => {
  if (useMockData) {
    return mockSearchResults.filter(
      (stock) => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) || 
        stock.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  }

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords: query,
        apikey: API_KEY,
      },
    });

    if (response.data.bestMatches) {
      return response.data.bestMatches.map((match: any) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        type: match['3. type'],
        region: match['4. region'],
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
};

// Get stock quote
export const getStockQuote = async (symbol: string) => {
  if (useMockData) {
    const mockStock = mockStocks.find((stock) => stock.symbol === symbol);
    if (mockStock) {
      return {
        ...mockStock,
        lastUpdated: new Date().toISOString(),
      };
    }
    
    // Generate random data if the symbol is not in our mock data
    return {
      symbol,
      name: `${symbol} Inc.`,
      price: Math.random() * 1000 + 50,
      change: (Math.random() * 20) - 10,
      changePercent: (Math.random() * 5) - 2.5,
      open: Math.random() * 1000 + 45,
      high: Math.random() * 1000 + 55,
      low: Math.random() * 1000 + 40,
      volume: Math.floor(Math.random() * 10000000),
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey: API_KEY,
      },
    });

    const quote = response.data['Global Quote'];
    
    if (quote) {
      return {
        symbol,
        name: '', // The Global Quote endpoint doesn't return the company name
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        open: parseFloat(quote['02. open']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        volume: parseInt(quote['06. volume']),
        lastUpdated: new Date().toISOString(),
      };
    }
    
    throw new Error('No quote data found');
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    throw error;
  }
};

// Get stock price history
export const getStockPriceHistory = async (symbol: string, timeframe: '1D' | '1W' | '1M' | '3M' | '1Y') => {
  if (useMockData) {
    // Generate mock price history data
    const dataPoints = getDataPointsForTimeframe(timeframe);
    const prices: number[] = [];
    const timestamps: string[] = [];
    
    let basePrice = 100;
    const now = new Date();
    
    for (let i = 0; i < dataPoints; i++) {
      // Generate a random price movement
      const change = (Math.random() - 0.48) * 2; // Slightly biased towards positive
      basePrice = basePrice * (1 + change / 100);
      prices.unshift(basePrice);
      
      // Generate timestamp
      const timestamp = new Date(now);
      
      switch (timeframe) {
        case '1D':
          timestamp.setMinutes(now.getMinutes() - i * 5);
          break;
        case '1W':
          timestamp.setHours(now.getHours() - i * 4);
          break;
        case '1M':
          timestamp.setDate(now.getDate() - i);
          break;
        case '3M':
          timestamp.setDate(now.getDate() - i * 3);
          break;
        case '1Y':
          timestamp.setDate(now.getDate() - i * 7);
          break;
      }
      
      timestamps.unshift(timestamp.toISOString());
    }
    
    return { prices, timestamps };
  }

  try {
    // Map timeframe to Alpha Vantage function and interval
    let func = 'TIME_SERIES_INTRADAY';
    let interval = '5min';
    let outputSize = 'compact';
    
    switch (timeframe) {
      case '1D':
        func = 'TIME_SERIES_INTRADAY';
        interval = '5min';
        break;
      case '1W':
        func = 'TIME_SERIES_INTRADAY';
        interval = '60min';
        outputSize = 'full';
        break;
      case '1M':
        func = 'TIME_SERIES_DAILY';
        break;
      case '3M':
        func = 'TIME_SERIES_DAILY';
        outputSize = 'full';
        break;
      case '1Y':
        func = 'TIME_SERIES_WEEKLY';
        break;
    }
    
    const response = await axios.get(BASE_URL, {
      params: {
        function: func,
        symbol,
        interval: func === 'TIME_SERIES_INTRADAY' ? interval : undefined,
        outputsize: outputSize,
        apikey: API_KEY,
      },
    });
    
    // Parse the response based on the timeframe
    let timeSeriesKey = '';
    
    switch (func) {
      case 'TIME_SERIES_INTRADAY':
        timeSeriesKey = `Time Series (${interval})`;
        break;
      case 'TIME_SERIES_DAILY':
        timeSeriesKey = 'Time Series (Daily)';
        break;
      case 'TIME_SERIES_WEEKLY':
        timeSeriesKey = 'Weekly Time Series';
        break;
    }
    
    const timeSeries = response.data[timeSeriesKey];
    
    if (timeSeries) {
      const timestamps: string[] = [];
      const prices: number[] = [];
      
      // Limit the number of data points based on the timeframe
      const maxDataPoints = getDataPointsForTimeframe(timeframe);
      let count = 0;
      
      for (const timestamp in timeSeries) {
        if (count >= maxDataPoints) break;
        
        timestamps.push(timestamp);
        prices.push(parseFloat(timeSeries[timestamp]['4. close']));
        count++;
      }
      
      // Reverse the arrays to get chronological order
      return {
        timestamps: timestamps.reverse(),
        prices: prices.reverse(),
      };
    }
    
    throw new Error('No time series data found');
  } catch (error) {
    console.error('Error fetching stock price history:', error);
    throw error;
  }
};

// Get stock news
export const getStockNews = async (symbol: string) => {
  if (useMockData) {
    return mockNews.filter((article) => 
      article.symbols.includes(symbol) || Math.random() > 0.5
    ).slice(0, 5);
  }

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        function: 'NEWS_SENTIMENT',
        tickers: symbol,
        apikey: API_KEY,
      },
    });
    
    if (response.data.feed) {
      return response.data.feed.map((item: any) => ({
        id: item.title.replace(/\s+/g, '-').toLowerCase(),
        title: item.title,
        summary: item.summary,
        url: item.url,
        source: item.source,
        publishedAt: item.time_published,
        sentiment: item.overall_sentiment_score,
      })).slice(0, 5);
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching stock news:', error);
    return [];
  }
};

// Get similar stocks
export const getSimilarStocks = async (symbol: string) => {
  if (useMockData) {
    // Filter out the current symbol and return a few random stocks
    return mockStocks
      .filter((stock) => stock.symbol !== symbol)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
  }

  // In a real app, we would use an endpoint that returns similar stocks
  // For now, we'll just return a few random stocks from our mock data
  return [];
};

// Get stock analysis from AI agents
export const getStockAnalysis = async (symbol: string) => {
  if (useMockData) {
    // Generate a mock analysis based on the symbol
    return generateMockAnalysis(symbol);
  }

  // In a real app, this would call a backend API that runs the multi-agent system
  // For now, we'll just return mock data
  return generateMockAnalysis(symbol);
};

// Helper function to determine the number of data points for a timeframe
const getDataPointsForTimeframe = (timeframe: '1D' | '1W' | '1M' | '3M' | '1Y'): number => {
  switch (timeframe) {
    case '1D':
      return 78; // 6.5 hours of trading, 5-minute intervals
    case '1W':
      return 42; // 7 days, 4-hour intervals
    case '1M':
      return 30; // 30 days
    case '3M':
      return 30; // 90 days, but we'll use 30 data points
    case '1Y':
      return 52; // 52 weeks
    default:
      return 30;
  }
};

// Helper function to generate mock analysis
const generateMockAnalysis = (symbol: string) => {
  // Use the symbol to seed the random number generator for consistent results
  let seed = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  
  // Generate a random recommendation
  const recommendations = ['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell'];
  const recommendationIndex = Math.floor(random() * 5);
  const recommendation = recommendations[recommendationIndex];
  
  // Generate a price target based on the current price
  const mockStock = mockStocks.find((stock) => stock.symbol === symbol);
  const currentPrice = mockStock ? mockStock.price : 100;
  const priceTarget = currentPrice * (1 + (random() * 0.4 - 0.2)); // +/- 20%
  
  // Generate technical indicators
  const indicators = [
    {
      name: 'Moving Average (50)',
      value: `$${(currentPrice * (1 + (random() * 0.1 - 0.05))).toFixed(2)}`,
      signal: random() > 0.5 ? 'Buy' : random() > 0.3 ? 'Hold' : 'Sell',
    },
    {
      name: 'RSI (14)',
      value: `${Math.floor(random() * 100)}`,
      signal: random() > 0.6 ? 'Buy' : random() > 0.4 ? 'Hold' : 'Sell',
    },
    {
      name: 'MACD',
      value: `${(random() * 2 - 1).toFixed(2)}`,
      signal: random() > 0.5 ? 'Buy' : random() > 0.3 ? 'Hold' : 'Sell',
    },
    {
      name: 'Bollinger Bands',
      value: `${random() > 0.5 ? 'Upper' : random() > 0.3 ? 'Middle' : 'Lower'}`,
      signal: random() > 0.6 ? 'Buy' : random() > 0.4 ? 'Hold' : 'Sell',
    },
  ];
  
  // Generate sentiment sources
  const sentimentSources = [
    {
      name: 'News Articles',
      sentiment: random() * 2 - 1, // -1 to 1
    },
    {
      name: 'Social Media',
      sentiment: random() * 2 - 1,
    },
    {
      name: 'Analyst Ratings',
      sentiment: random() * 2 - 1,
    },
    {
      name: 'Insider Trading',
      sentiment: random() * 2 - 1,
    },
  ];
  
  // Calculate overall sentiment score
  const sentimentScore = sentimentSources.reduce((acc, source) => acc + source.sentiment, 0) / sentimentSources.length;
  
  // Generate risk factors
  const riskFactors = [
    {
      name: 'Market Volatility',
      level: random() > 0.6 ? 'High' : random() > 0.3 ? 'Medium' : 'Low',
      description: 'Risk associated with overall market conditions and volatility.',
    },
    {
      name: 'Sector Performance',
      level: random() > 0.6 ? 'High' : random() > 0.3 ? 'Medium' : 'Low',
      description: `The ${getRandomSector()} sector has been ${random() > 0.5 ? 'outperforming' : 'underperforming'} the market.`,
    },
    {
      name: 'Financial Health',
      level: random() > 0.6 ? 'High' : random() > 0.3 ? 'Medium' : 'Low',
      description: `Company has ${random() > 0.5 ? 'strong' : 'concerning'} financial indicators.`,
    },
    {
      name: 'Competition',
      level: random() > 0.6 ? 'High' : random() > 0.3 ? 'Medium' : 'Low',
      description: `Faces ${random() > 0.5 ? 'significant' : 'moderate'} competition in its market segment.`,
    },
  ];
  
  // Calculate overall risk score
  const riskScore = Math.floor(random() * 100);
  const overallRisk = riskScore < 33 ? 'Low' : riskScore < 66 ? 'Medium' : 'High';
  
  return {
    symbol,
    summary: generateSummary(symbol, recommendation, priceTarget, currentPrice),
    recommendation,
    recommendationReason: generateRecommendationReason(recommendation, symbol),
    priceTarget,
    confidence: Math.floor(random() * 40) + 60, // 60-99%
    timeHorizon: random() > 0.6 ? 'Long-term' : random() > 0.3 ? 'Medium-term' : 'Short-term',
    
    technicalAnalysis: {
      summary: generateTechnicalSummary(indicators, symbol),
      indicators,
    },
    
    sentimentAnalysis: {
      summary: generateSentimentSummary(sentimentScore, symbol),
      score: sentimentScore,
      sources: sentimentSources,
    },
    
    riskAnalysis: {
      summary: generateRiskSummary(overallRisk, symbol),
      overallRisk,
      riskScore,
      riskFactors,
    },
  };
};

// Helper functions to generate text for the analysis
const generateSummary = (symbol: string, recommendation: string, priceTarget: number, currentPrice: number) => {
  const percentChange = ((priceTarget - currentPrice) / currentPrice * 100).toFixed(2);
  const direction = priceTarget > currentPrice ? 'upside' : 'downside';
  
  return `Based on our multi-agent analysis system, ${symbol} currently shows a ${recommendation.toLowerCase()} signal with a price target of $${priceTarget.toFixed(2)}, representing a ${Math.abs(parseFloat(percentChange))}% potential ${direction}. The company demonstrates ${Math.random() > 0.5 ? 'strong' : 'mixed'} fundamentals and ${Math.random() > 0.5 ? 'positive' : 'challenging'} technical indicators.`;
};

const generateRecommendationReason = (recommendation: string, symbol: string) => {
  switch (recommendation) {
    case 'Strong Buy':
      return `${symbol} shows exceptional growth potential with strong fundamentals and positive technical indicators. Our analysis suggests significant upside potential in both short and long-term horizons.`;
    case 'Buy':
      return `${symbol} demonstrates solid performance metrics and favorable market conditions. The stock appears undervalued relative to its peers and shows promising growth trajectory.`;
    case 'Hold':
      return `${symbol} currently trades at a fair valuation. While there are some positive indicators, there are also potential headwinds that suggest caution. Existing investors should maintain positions but new investments should be carefully considered.`;
    case 'Sell':
      return `${symbol} faces significant challenges that may impact future performance. Technical indicators suggest downward pressure, and the risk-reward profile has deteriorated.`;
    case 'Strong Sell':
      return `${symbol} shows concerning fundamentals and negative technical trends. Our analysis indicates high risk and potential for significant downside in the near to medium term.`;
    default:
      return `Our analysis of ${symbol} is inconclusive at this time due to mixed signals in the market.`;
  }
};

const generateTechnicalSummary = (indicators: any[], symbol: string) => {
  const buySignals = indicators.filter(i => i.signal === 'Buy').length;
  const sellSignals = indicators.filter(i => i.signal === 'Sell').length;
  
  if (buySignals > sellSignals) {
    return `Technical indicators for ${symbol} are predominantly bullish, with ${buySignals} out of ${indicators.length} showing buy signals. The stock is trading ${Math.random() > 0.5 ? 'above' : 'near'} key moving averages, suggesting positive momentum.`;
  } else if (sellSignals > buySignals) {
    return `Technical indicators for ${symbol} are predominantly bearish, with ${sellSignals} out of ${indicators.length} showing sell signals. The stock is trading ${Math.random() > 0.5 ? 'below' : 'near'} key support levels, suggesting potential downside risk.`;
  } else {
    return `Technical indicators for ${symbol} are mixed, with equal buy and sell signals. The stock is in a consolidation phase, and a breakout in either direction could determine the next trend.`;
  }
};

const generateSentimentSummary = (score: number, symbol: string) => {
  if (score > 0.3) {
    return `Market sentiment for ${symbol} is strongly positive, with favorable coverage in news and social media. Analyst ratings have been upgraded recently, and institutional investors have been increasing their positions.`;
  } else if (score > 0) {
    return `Market sentiment for ${symbol} is mildly positive, with mixed but generally favorable coverage. Some analysts remain cautious, but the overall sentiment trend is improving.`;
  } else if (score > -0.3) {
    return `Market sentiment for ${symbol} is slightly negative, with some concerns expressed in recent coverage. Analyst opinions are mixed, and social media sentiment shows some skepticism.`;
  } else {
    return `Market sentiment for ${symbol} is decidedly negative, with unfavorable coverage across multiple channels. Analyst downgrades and negative news have contributed to the bearish sentiment.`;
  }
};

const generateRiskSummary = (risk: string, symbol: string) => {
  switch (risk) {
    case 'Low':
      return `${symbol} presents a relatively low-risk investment profile. The company has stable financials, operates in a predictable market environment, and has demonstrated resilience during market downturns.`;
    case 'Medium':
      return `${symbol} carries a moderate level of risk. While the company has solid fundamentals, there are some external factors and market conditions that could impact performance in the short to medium term.`;
    case 'High':
      return `${symbol} exhibits a high-risk profile. The company faces significant challenges including market volatility, competitive pressures, and potential financial constraints that could affect future performance.`;
    default:
      return `Risk assessment for ${symbol} is inconclusive due to limited data or unusual market conditions.`;
  }
};

const getRandomSector = () => {
  const sectors = [
    'Technology',
    'Healthcare',
    'Financial',
    'Consumer Discretionary',
    'Energy',
    'Industrial',
    'Communication Services',
    'Materials',
    'Utilities',
    'Real Estate',
  ];
  
  return sectors[Math.floor(Math.random() * sectors.length)];
};

// Mock data
const mockSearchResults = [
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'Equity', region: 'United States' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Equity', region: 'United States' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Equity', region: 'United States' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'Equity', region: 'United States' },
  { symbol: 'META', name: 'Meta Platforms Inc.', type: 'Equity', region: 'United States' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'Equity', region: 'United States' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'Equity', region: 'United States' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'Equity', region: 'United States' },
  { symbol: 'V', name: 'Visa Inc.', type: 'Equity', region: 'United States' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'Equity', region: 'United States' },
];

const mockStocks = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 182.52,
    change: 1.23,
    changePercent: 0.68,
    open: 181.29,
    high: 183.12,
    low: 180.87,
    volume: 58432100,
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 417.88,
    change: -2.34,
    changePercent: -0.56,
    open: 420.22,
    high: 421.15,
    low: 416.43,
    volume: 23567800,
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 174.13,
    change: 0.87,
    changePercent: 0.50,
    open: 173.26,
    high: 175.21,
    low: 172.89,
    volume: 19876500,
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 178.75,
    change: -1.05,
    changePercent: -0.58,
    open: 179.80,
    high: 180.42,
    low: 177.98,
    volume: 32145600,
  },
  {
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    price: 474.99,
    change: 3.45,
    changePercent: 0.73,
    open: 471.54,
    high: 476.21,
    low: 470.88,
    volume: 15678900,
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 248.42,
    change: -5.67,
    changePercent: -2.23,
    open: 254.09,
    high: 255.32,
    low: 247.65,
    volume: 87654300,
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 116.21,
    change: 2.34,
    changePercent: 2.05,
    open: 113.87,
    high: 117.45,
    low: 113.56,
    volume: 65432100,
  },
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    price: 198.56,
    change: 0.78,
    changePercent: 0.39,
    open: 197.78,
    high: 199.23,
    low: 197.45,
    volume: 12345600,
  },
];

const mockNews = [
  {
    id: 'apple-unveils-new-iphone',
    title: 'Apple Unveils New iPhone with Revolutionary AI Features',
    summary: 'Apple Inc. has announced its latest iPhone model featuring groundbreaking AI capabilities that could reshape the smartphone industry. The new device includes enhanced neural processing and advanced machine learning algorithms.',
    url: 'https://example.com/news/apple-new-iphone',
    source: 'Tech Today',
    publishedAt: '2023-09-12T14:30:00Z',
    sentiment: 0.8,
    symbols: ['AAPL'],
  },
  {
    id: 'microsoft-cloud-growth',
    title: 'Microsoft Cloud Business Sees Unprecedented Growth in Q2',
    summary: 'Microsoft reported exceptional growth in its cloud services division, with Azure revenue increasing by 27% year-over-year. The company attributes this success to increased enterprise adoption and expanded AI capabilities.',
    url: 'https://example.com/news/microsoft-cloud-growth',
    source: 'Business Insider',
    publishedAt: '2023-07-25T10:15:00Z',
    sentiment: 0.6,
    symbols: ['MSFT'],
  },
  {
    id: 'google-antitrust-concerns',
    title: 'Google Faces New Antitrust Scrutiny Over AI Search Integration',
    summary: 'Alphabet\'s Google is under investigation by regulators concerned about potential anticompetitive practices related to the integration of its AI technology in search results. The company maintains that its practices benefit consumers.',
    url: 'https://example.com/news/google-antitrust',
    source: 'Wall Street Journal',
    publishedAt: '2023-08-05T16:45:00Z',
    sentiment: -0.4,
    symbols: ['GOOGL'],
  },
  {
    id: 'amazon-expands-healthcare',
    title: 'Amazon Expands Healthcare Initiative with New Acquisitions',
    summary: 'Amazon is strengthening its position in the healthcare sector through strategic acquisitions of telemedicine providers and pharmacy services. Analysts see this as a significant move to disrupt the traditional healthcare industry.',
    url: 'https://example.com/news/amazon-healthcare',
    source: 'Healthcare Daily',
    publishedAt: '2023-08-18T09:30:00Z',
    sentiment: 0.5,
    symbols: ['AMZN'],
  },
  {
    id: 'meta-metaverse-progress',
    title: 'Meta\'s Metaverse Investment Shows First Signs of Profitability',
    summary: 'After years of heavy investment, Meta Platforms is beginning to see returns from its metaverse initiatives. The company reported increased user engagement and growing revenue streams from virtual reality products and services.',
    url: 'https://example.com/news/meta-metaverse',
    source: 'Tech Crunch',
    publishedAt: '2023-09-02T11:20:00Z',
    sentiment: 0.7,
    symbols: ['META'],
  },
  {
    id: 'tesla-production-challenges',
    title: 'Tesla Faces Production Challenges Amid Supply Chain Disruptions',
    summary: 'Tesla is experiencing production delays at its gigafactories due to ongoing supply chain issues and raw material shortages. The company has revised its delivery estimates for the quarter, potentially impacting annual targets.',
    url: 'https://example.com/news/tesla-production',
    source: 'Auto News',
    publishedAt: '2023-08-28T13:45:00Z',
    sentiment: -0.6,
    symbols: ['TSLA'],
  },
  {
    id: 'nvidia-ai-chip-demand',
    title: 'NVIDIA Cannot Keep Up with Demand for AI Chips',
    summary: 'NVIDIA is struggling to meet the extraordinary demand for its AI accelerator chips, with waiting lists extending months for some products. The company is ramping up production capacity but faces constraints in the semiconductor supply chain.',
    url: 'https://example.com/news/nvidia-demand',
    source: 'Semiconductor Today',
    publishedAt: '2023-09-08T15:10:00Z',
    sentiment: 0.3,
    symbols: ['NVDA'],
  },
  {
    id: 'jpmorgan-interest-rates',
    title: 'JPMorgan CEO Warns of Persistent High Interest Rates',
    summary: 'JPMorgan Chase CEO Jamie Dimon cautioned investors that interest rates may remain elevated longer than markets anticipate, citing ongoing inflation concerns and Federal Reserve policy. This could impact lending and investment strategies.',
    url: 'https://example.com/news/jpmorgan-rates',
    source: 'Financial Times',
    publishedAt: '2023-08-15T08:30:00Z',
    sentiment: -0.2,
    symbols: ['JPM'],
  },
];