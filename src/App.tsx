import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Search, TrendingUp, BarChart3, Activity, RefreshCw } from 'lucide-react';
import StockSearch from './components/StockSearch';
import StockChart from './components/StockChart';
import StockInfo from './components/StockInfo';
import StockNews from './components/StockNews';
import StockRecommendations from './components/StockRecommendations';
import AgentSystem from './components/AgentSystem';

// Create a client
const queryClient = new QueryClient();

function App() {
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '3M' | '1Y'>('1M');

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-900">Stock Analysis Dashboard</h1>
            </div>
            <StockSearch onSelectStock={setSelectedStock} />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          {selectedStock ? (
            <>
              <div className="mb-6">
                <StockInfo symbol={selectedStock} />
              </div>

              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
                    Price Chart
                  </h2>
                  <div className="flex space-x-2">
                    {(['1D', '1W', '1M', '3M', '1Y'] as const).map((t) => (
                      <button
                        key={t}
                        className={`px-3 py-1 text-sm rounded-md ${
                          timeframe === t
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        onClick={() => setTimeframe(t)}
                      >
                        {t}
                      </button>
                    ))}
                    <button className="p-1 rounded-md text-gray-500 hover:bg-gray-200">
                      <RefreshCw className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <StockChart symbol={selectedStock} timeframe={timeframe} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                    <Activity className="h-5 w-5 text-blue-500 mr-2" />
                    AI Analysis
                  </h2>
                  <AgentSystem symbol={selectedStock} />
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Latest News</h2>
                  <StockNews symbol={selectedStock} />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Similar Stocks</h2>
                <StockRecommendations symbol={selectedStock} />
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-medium text-gray-600">Search for a stock to begin analysis</h2>
              <p className="text-gray-500 mt-2">
                Enter a company name or ticker symbol in the search box above
              </p>
            </div>
          )}
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;