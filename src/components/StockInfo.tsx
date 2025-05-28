import React from 'react';
import { useQuery } from 'react-query';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { getStockQuote } from '../services/api';

interface StockInfoProps {
  symbol: string;
}

const StockInfo: React.FC<StockInfoProps> = ({ symbol }) => {
  const { data, isLoading, error } = useQuery(
    ['stockQuote', symbol],
    () => getStockQuote(symbol),
    {
      staleTime: 60000, // 1 minute
      refetchInterval: 60000, // Refresh every minute
    }
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-500">Error loading stock information. Please try again later.</div>
      </div>
    );
  }

  const isPositive = data.change >= 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{data.symbol}</h2>
          <p className="text-gray-600">{data.name}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-gray-900">${data.price.toFixed(2)}</div>
          <div className={`flex items-center justify-end ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            <span className="font-medium">
              {isPositive ? '+' : ''}
              {data.change.toFixed(2)} ({data.changePercent.toFixed(2)}%)
            </span>
          </div>
          <div className="text-xs text-gray-500 flex items-center justify-end mt-1">
            <Clock className="h-3 w-3 mr-1" />
            <span>Last updated: {new Date(data.lastUpdated).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm text-gray-500">Open</div>
          <div className="font-medium">${data.open.toFixed(2)}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm text-gray-500">High</div>
          <div className="font-medium">${data.high.toFixed(2)}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm text-gray-500">Low</div>
          <div className="font-medium">${data.low.toFixed(2)}</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="text-sm text-gray-500">Volume</div>
          <div className="font-medium">{data.volume.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
};

export default StockInfo;