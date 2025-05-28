import React from 'react';
import { useQuery } from 'react-query';
import { ExternalLink } from 'lucide-react';
import { getStockNews } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

interface StockNewsProps {
  symbol: string;
}

const StockNews: React.FC<StockNewsProps> = ({ symbol }) => {
  const { data, isLoading, error } = useQuery(
    ['stockNews', symbol],
    () => getStockNews(symbol),
    {
      staleTime: 300000, // 5 minutes
    }
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-20 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !data || data.length === 0) {
    return (
      <div className="text-gray-500 text-center py-6">
        No recent news available for {symbol}.
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {data.map((article) => (
        <div key={article.id} className="border-b border-gray-200 pb-4 last:border-0">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 flex items-start">
              {article.title}
              <ExternalLink className="h-3 w-3 ml-1 mt-1 text-gray-400 group-hover:text-blue-600" />
            </h3>
            <div className="text-xs text-gray-500 mb-2">
              {article.source} • {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
            </div>
            <p className="text-sm text-gray-600 line-clamp-3">{article.summary}</p>
          </a>
        </div>
      ))}
    </div>
  );
};

export default StockNews;