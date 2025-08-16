export interface StrategyParameter {
  name: string;
  label: string;
  type: 'number' | 'select' | 'range';
  min?: number;
  max?: number;
  step?: number;
  defaultValue: number;
  description?: string;
  options?: { value: number; label: string }[];
}

export interface StrategyConfig {
  name: string;
  label: string;
  description: string;
  parameters: StrategyParameter[];
}

export const strategyConfigs: StrategyConfig[] = [
  {
    name: 'basicMomentum',
    label: 'Basic Momentum',
    description: 'Simple momentum strategy based on rolling returns',
    parameters: [
      {
        name: 'window',
        label: 'Lookback Window',
        type: 'number',
        min: 5,
        max: 100,
        step: 1,
        defaultValue: 20,
        description: 'Number of days to look back for momentum calculation'
      }
    ]
  },
  {
    name: 'advancedMomentum',
    label: 'Advanced Momentum',
    description: 'Multi-asset momentum strategy with top percentile selection',
    parameters: [
      {
        name: 'lookback',
        label: 'Lookback Period',
        type: 'number',
        min: 5,
        max: 100,
        step: 1,
        defaultValue: 20,
        description: 'Number of days to look back for momentum calculation'
      },
      {
        name: 'topPercent',
        label: 'Top Percentile',
        type: 'range',
        min: 0.05,
        max: 0.5,
        step: 0.05,
        defaultValue: 0.2,
        description: 'Percentage of top performing assets to select'
      }
    ]
  },
  {
    name: 'meanReversionML',
    label: 'Mean Reversion ML',
    description: 'Mean reversion strategy using RSI and future price prediction',
    parameters: [
      {
        name: 'window',
        label: 'RSI Window',
        type: 'number',
        min: 5,
        max: 50,
        step: 1,
        defaultValue: 14,
        description: 'Window size for RSI calculation'
      },
      {
        name: 'xPct',
        label: 'Price Increase Threshold',
        type: 'range',
        min: 0.005,
        max: 0.05,
        step: 0.001,
        defaultValue: 0.01,
        description: 'Minimum price increase percentage to trigger signal'
      },
      {
        name: 'yDays',
        label: 'Future Look Days',
        type: 'number',
        min: 1,
        max: 20,
        step: 1,
        defaultValue: 5,
        description: 'Number of days to look ahead for price prediction'
      },
      {
        name: 'rsiThreshold',
        label: 'RSI Threshold',
        type: 'number',
        min: 10,
        max: 50,
        step: 5,
        defaultValue: 30,
        description: 'RSI level below which to consider oversold conditions'
      }
    ]
  },
  {
    name: 'volatilityBreakout',
    label: 'Volatility Breakout',
    description: 'Breakout strategy based on Average True Range (ATR)',
    parameters: [
      {
        name: 'period',
        label: 'ATR Period',
        type: 'number',
        min: 5,
        max: 50,
        step: 1,
        defaultValue: 14,
        description: 'Period for ATR calculation'
      },
      {
        name: 'k',
        label: 'Breakout Multiplier',
        type: 'range',
        min: 0.5,
        max: 3.0,
        step: 0.1,
        defaultValue: 1.0,
        description: 'Multiplier for ATR to determine breakout level'
      }
    ]
  }
];

export function getStrategyConfig(strategyName: string): StrategyConfig | undefined {
  return strategyConfigs.find(config => config.name === strategyName);
}

export function getDefaultParams(strategyName: string): Record<string, number> {
  const config = getStrategyConfig(strategyName);
  if (!config) return {};
  
  const params: Record<string, number> = {};
  config.parameters.forEach(param => {
    params[param.name] = param.defaultValue;
  });
  return params;
}
