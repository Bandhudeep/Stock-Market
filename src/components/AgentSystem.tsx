import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Bot, BarChart3, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import { getStockAnalysis } from '../services/api';

interface AgentSystemProps {
  symbol: string;
}

const AgentSystem: React.FC<AgentSystemProps> = ({ symbol }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'technical' | 'sentiment' | 'risk'>('summary');
  
  const { data, isLoading, error, refetch } = useQuery(
    ['stockAnalysis', symbol],
    () => getStockAnalysis(symbol),
    {
      staleTime: 3600000, // 1 hour
      enabled: !!symbol,
    }
  );

  useEffect(() => {
    if (symbol) {
      refetch();
    }
  }, [symbol, refetch]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
        <div className="text-gray-600">
          <p className="font-medium">AI agents are analyzing {symbol}...</p>
          <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p>Error generating analysis. Please try again later.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'summary'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'technical'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('technical')}
        >
          Technical
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'sentiment'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('sentiment')}
        >
          Sentiment
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'risk'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('risk')}
        >
          Risk
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'summary' && (
          <div>
            <div className="flex items-start mb-4">
              <Bot className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">AI Summary</h3>
                <p className="text-sm text-gray-600 mt-1">{data.summary}</p>
              </div>
            </div>
            
            <div className="bg-blue-50 rounded-md p-4 mt-4">
              <div className="flex items-center mb-2">
                <div className={`h-4 w-4 rounded-full ${getRecommendationColor(data.recommendation)} mr-2`}></div>
                <h4 className="font-medium">Recommendation: {data.recommendation}</h4>
              </div>
              <p className="text-sm text-gray-600">{data.recommendationReason}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-xs text-gray-500 mb-1">Price Target</div>
                <div className="font-medium">${data.priceTarget.toFixed(2)}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-xs text-gray-500 mb-1">Confidence</div>
                <div className="font-medium">{data.confidence}%</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-xs text-gray-500 mb-1">Time Horizon</div>
                <div className="font-medium">{data.timeHorizon}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'technical' && (
          <div>
            <div className="flex items-start mb-4">
              <BarChart3 className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Technical Analysis</h3>
                <p className="text-sm text-gray-600 mt-1">{data.technicalAnalysis.summary}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-4">
              {data.technicalAnalysis.indicators.map((indicator) => (
                <div key={indicator.name} className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between">
                    <div className="text-sm font-medium">{indicator.name}</div>
                    <div className={`text-xs font-medium ${
                      indicator.signal === 'Buy' ? 'text-green-600' : 
                      indicator.signal === 'Sell' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {indicator.signal}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{indicator.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sentiment' && (
          <div>
            <div className="flex items-start mb-4">
              <TrendingUp className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Market Sentiment</h3>
                <p className="text-sm text-gray-600 mt-1">{data.sentimentAnalysis.summary}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mt-4">
              <h4 className="text-sm font-medium mb-2">Sentiment Score</h4>
              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`absolute top-0 left-0 h-full ${getSentimentColor(data.sentimentAnalysis.score)}`}
                  style={{ width: `${Math.abs(data.sentimentAnalysis.score) * 100}%`, left: data.sentimentAnalysis.score < 0 ? '50%' : '0' }}
                ></div>
                <div className="absolute top-0 left-1/2 w-px h-full bg-gray-400"></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Bearish</span>
                <span>Neutral</span>
                <span>Bullish</span>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Sentiment Sources</h4>
              <div className="space-y-2">
                {data.sentimentAnalysis.sources.map((source, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{source.name}</span>
                    <span className={`font-medium ${
                      source.sentiment > 0 ? 'text-green-600' : 
                      source.sentiment < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {source.sentiment > 0 ? 'Positive' : source.sentiment < 0 ? 'Negative' : 'Neutral'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'risk' && (
          <div>
            <div className="flex items-start mb-4">
              <AlertTriangle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Risk Assessment</h3>
                <p className="text-sm text-gray-600 mt-1">{data.riskAnalysis.summary}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md mt-4">
              <h4 className="text-sm font-medium mb-2">Overall Risk: {data.riskAnalysis.overallRisk}</h4>
              <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`absolute top-0 left-0 h-full ${getRiskColor(data.riskAnalysis.riskScore)}`}
                  style={{ width: `${data.riskAnalysis.riskScore}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Risk Factors</h4>
              <div className="space-y-2">
                {data.riskAnalysis.riskFactors.map((factor, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between">
                      <div className="text-sm font-medium">{factor.name}</div>
                      <div className={`text-xs font-medium ${
                        factor.level === 'Low' ? 'text-green-600' : 
                        factor.level === 'High' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {factor.level}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">{factor.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper functions for styling
const getRecommendationColor = (recommendation: string) => {
  switch (recommendation) {
    case 'Strong Buy':
    case 'Buy':
      return 'bg-green-500';
    case 'Hold':
      return 'bg-yellow-500';
    case 'Sell':
    case 'Strong Sell':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

const getSentimentColor = (score: number) => {
  if (score > 0) {
    return 'bg-green-500';
  } else if (score < 0) {
    return 'bg-red-500';
  }
  return 'bg-yellow-500';
};

const getRiskColor = (score: number) => {
  if (score < 33) {
    return 'bg-green-500';
  } else if (score < 66) {
    return 'bg-yellow-500';
  }
  return 'bg-red-500';
};

export default AgentSystem;