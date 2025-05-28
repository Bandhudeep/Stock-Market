import React from 'react';
import { useQuery } from 'react-query';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { getSimilarStocks } from '../services/api';

interface StockRecommendationsProps {
  symbol: string;
}

const StockRecommendations: React.FC<StockRecommendationsProps> = ({ symbol }) => {
  const { data, isLoading, error } = useQuery(
    ['similarStocks', symbol],
    () => getSimilarStocks(symbol),
    {
      staleTime: 3600000, // 1 hour
    }
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-50 p-4 rounded-md">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="text-gray-500 text-center py-6">
        No similar stocks available for {symbol}.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {data.map((stock) => {
        const isPositive = stock.changePercent >= 0;
        
        return (
          <div key={stock.symbol} className="bg-gray-50 p-4 rounded-md hover:bg-gray-100 cursor-pointer">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm text-gray-500">{stock.symbol}</div>
                <div className="font-medium truncate" title={stock.name}>
                  {stock.name}
                </div>
              </div>
              <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                <span className="text-sm font-medium">
                  {isPositive ? '+' : ''}
                  {stock.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
            <div className="mt-2 text-lg font-semibold">${stock.price.toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-1">
              Vol: {stock.volume.toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StockRecommendations;