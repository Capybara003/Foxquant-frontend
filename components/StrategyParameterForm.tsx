import React from 'react';
import { StrategyConfig, StrategyParameter } from '@/app/backtest/strategyConfig';

interface StrategyParameterFormProps {
  strategyConfig: StrategyConfig;
  params: Record<string, number>;
  onParamsChange: (params: Record<string, number>) => void;
}

export default function StrategyParameterForm({ 
  strategyConfig, 
  params, 
  onParamsChange 
}: StrategyParameterFormProps) {
  
  const handleParamChange = (paramName: string, value: number) => {
    const newParams = { ...params, [paramName]: value };
    onParamsChange(newParams);
  };

  const renderParameterInput = (param: StrategyParameter) => {
    const value = params[param.name] ?? param.defaultValue;

    switch (param.type) {
      case 'number':
        return (
          <input
            type="number"
            value={value}
            min={param.min}
            max={param.max}
            step={param.step}
            onChange={(e) => handleParamChange(param.name, Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        );
      
      case 'range':
        return (
          <div className="space-y-2">
            <input
              type="range"
              value={value}
              min={param.min}
              max={param.max}
              step={param.step}
              onChange={(e) => handleParamChange(param.name, Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{param.min}</span>
              <span className="font-medium">{value}</span>
              <span>{param.max}</span>
            </div>
          </div>
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleParamChange(param.name, Number(e.target.value))}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {param.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {strategyConfig.parameters.map((param) => (
          <div key={param.name} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {param.label}
            </label>
            {renderParameterInput(param)}
            {param.description && (
              <p className="text-xs text-gray-500">{param.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
