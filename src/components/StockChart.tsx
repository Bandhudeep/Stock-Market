import React from 'react';
import { useQuery } from 'react-query';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { getStockPriceHistory } from '../services/api';
import { format } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface StockChartProps {
  symbol: string;
  timeframe: '1D' | '1W' | '1M' | '3M' | '1Y';
}

const StockChart: React.FC<StockChartProps> = ({ symbol, timeframe }) => {
  const { data, isLoading, error } = useQuery(
    ['stockPriceHistory', symbol, timeframe],
    () => getStockPriceHistory(symbol, timeframe),
    {
      staleTime: 300000, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        Error loading chart data. Please try again later.
      </div>
    );
  }

  // Format the data for the chart
  const chartData = {
    labels: data.timestamps.map((timestamp) => {
      const date = new Date(timestamp);
      if (timeframe === '1D') {
        return format(date, 'HH:mm');
      } else if (timeframe === '1W') {
        return format(date, 'EEE');
      } else {
        return format(date, 'MMM dd');
      }
    }),
    datasets: [
      {
        label: symbol,
        data: data.prices,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.1,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        position: 'right' as const,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default StockChart;