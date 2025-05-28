import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { useQuery } from 'react-query';
import { searchStocks } from '../services/api';

interface StockSearchProps {
  onSelectStock: (symbol: string) => void;
}

const StockSearch: React.FC<StockSearchProps> = ({ onSelectStock }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: searchResults, isLoading } = useQuery(
    ['stockSearch', searchTerm],
    () => searchStocks(searchTerm),
    {
      enabled: searchTerm.length > 1,
      staleTime: 60000, // 1 minute
    }
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (e.target.value.length > 1) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleSelectStock = (symbol: string) => {
    onSelectStock(symbol);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-72" ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Search for a stock..."
          value={searchTerm}
          onChange={handleSearch}
          onFocus={() => searchTerm.length > 1 && setIsOpen(true)}
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-sm">
          {isLoading ? (
            <div className="px-4 py-2 text-gray-500">Loading...</div>
          ) : searchResults && searchResults.length > 0 ? (
            searchResults.map((result) => (
              <div
                key={result.symbol}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelectStock(result.symbol)}
              >
                <div className="font-medium">{result.symbol}</div>
                <div className="text-xs text-gray-500 truncate">{result.name}</div>
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-gray-500">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockSearch;