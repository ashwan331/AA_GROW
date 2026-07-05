import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { CloudSun, Sun, CloudRain, Wind, Droplets } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const WeatherIntelligence = () => {
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    // Mock fetch
    setTimeout(() => {
      setWeather({
        forecast: { temp: 28, humidity: 65, condition: 'Partly Cloudy', precipitation_chance: 20 },
        recommendations: [
          'Good day for spraying pesticides if needed, as wind is calm and no immediate rain is expected.',
          'Soil moisture is optimal, irrigation can be skipped today.'
        ]
      });
    }, 1000);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Weather Intelligence</h1>
        <p className="text-muted-foreground mt-1">7-day hyper-local forecast and AI farming recommendations.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
          <CardHeader>
            <CardTitle>Current Conditions</CardTitle>
            <CardDescription>Your Farm Location</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-6">
            <CloudSun className="w-24 h-24 text-primary mb-4" />
            <h2 className="text-5xl font-bold">{weather?.forecast?.temp || '--'}°C</h2>
            <p className="text-xl text-muted-foreground mt-2">{weather?.forecast?.condition || 'Loading...'}</p>
            
            <div className="flex w-full justify-between mt-8 border-t border-border pt-4">
              <div className="text-center">
                <p className="text-muted-foreground text-sm flex items-center justify-center gap-1"><Droplets className="h-4 w-4"/> Humidity</p>
                <p className="font-semibold text-lg">{weather?.forecast?.humidity || '--'}%</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-sm flex items-center justify-center gap-1"><Wind className="h-4 w-4"/> Wind</p>
                <p className="font-semibold text-lg">12 km/h</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground text-sm flex items-center justify-center gap-1"><CloudRain className="h-4 w-4"/> Rain</p>
                <p className="font-semibold text-lg">{weather?.forecast?.precipitation_chance || '--'}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sun className="h-5 w-5 text-orange-500" /> AI Recommendations</CardTitle>
            <CardDescription>Actions based on the next 24 hours weather forecast.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 pt-4">
              {weather ? (
                weather.recommendations.map((rec: string, idx: number) => (
                  <div key={idx} className="bg-muted p-4 rounded-xl border-l-4 border-l-primary flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary mt-0.5 shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-sm leading-relaxed">{rec}</p>
                  </div>
                ))
              ) : (
                <div className="space-y-4 animate-pulse">
                  <div className="h-20 bg-muted rounded-xl"></div>
                  <div className="h-20 bg-muted rounded-xl"></div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
