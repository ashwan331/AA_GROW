import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Droplets, CloudRain, Zap, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SmartIrrigation = () => {
  const { user } = useAuth();
  const [soilData, setSoilData] = useState({ moisture_level: 45, ph: 6.5, nitrogen: 12, phosphorus: 8, potassium: 5 });
  const [isWatering, setIsWatering] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSoil = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/irrigation/soil', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || 'mock-token'}` }
        });
        const data = await res.json();
        if (data.soil) setSoilData(data.soil);
      } catch (err) {
        // Fallback to initial state
      } finally {
        setLoading(false);
      }
    };
    fetchSoil();
  }, []);

  const triggerWatering = async () => {
    setIsWatering(true);
    try {
      await fetch('http://localhost:5000/api/irrigation/trigger', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || 'mock-token'}`
        },
        body: JSON.stringify({ moisture_before: soilData.moisture_level, water_volume_liters: 500 })
      });
      // Simulate water increasing
      setTimeout(() => {
        setSoilData(prev => ({ ...prev, moisture_level: Math.min(prev.moisture_level + 30, 100) }));
        setIsWatering(false);
      }, 2000);
    } catch (error) {
      setIsWatering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Smart Irrigation</h1>
          <p className="text-muted-foreground mt-1">Real-time IoT soil sensors & automated watering control.</p>
        </div>
        <Button variant="outline" className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Dial */}
        <Card className="md:col-span-1 border-primary/20">
          <CardHeader>
            <CardTitle>Soil Moisture</CardTitle>
            <CardDescription>Current field average</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center py-6">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="hsl(var(--muted))" strokeWidth="10" fill="transparent" />
                <circle 
                  cx="50" cy="50" r="40" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth="10" 
                  fill="transparent" 
                  strokeDasharray={`${soilData.moisture_level * 2.51} 251`} 
                  className="transition-all duration-1000 ease-in-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{Math.round(soilData.moisture_level)}%</span>
                <span className="text-sm text-muted-foreground mt-1">
                  {soilData.moisture_level < 30 ? 'Dry' : soilData.moisture_level > 70 ? 'Saturated' : 'Optimal'}
                </span>
              </div>
            </div>
            <div className="mt-8 w-full">
              <Button 
                onClick={triggerWatering} 
                disabled={isWatering || soilData.moisture_level > 70} 
                className="w-full h-12 text-lg font-medium shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow"
              >
                {isWatering ? (
                  <><RefreshCw className="mr-2 h-5 w-5 animate-spin" /> Watering...</>
                ) : (
                  <><CloudRain className="mr-2 h-5 w-5" /> Manual Override</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* NPK Data */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Nutrient Profile (NPK & pH)</CardTitle>
            <CardDescription>Sensor readings across Field Sector A</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6">
            <div className="bg-muted/40 p-6 rounded-2xl border flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-3">
                <span className="text-xl font-bold">N</span>
              </div>
              <p className="text-2xl font-bold">{soilData.nitrogen} <span className="text-sm font-normal text-muted-foreground">mg/kg</span></p>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Nitrogen</p>
            </div>
            <div className="bg-muted/40 p-6 rounded-2xl border flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-full flex items-center justify-center mb-3">
                <span className="text-xl font-bold">P</span>
              </div>
              <p className="text-2xl font-bold">{soilData.phosphorus} <span className="text-sm font-normal text-muted-foreground">mg/kg</span></p>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Phosphorus</p>
            </div>
            <div className="bg-muted/40 p-6 rounded-2xl border flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mb-3">
                <span className="text-xl font-bold">K</span>
              </div>
              <p className="text-2xl font-bold">{soilData.potassium} <span className="text-sm font-normal text-muted-foreground">mg/kg</span></p>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">Potassium</p>
            </div>
            <div className="bg-muted/40 p-6 rounded-2xl border flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                <Droplets className="h-6 w-6" />
              </div>
              <p className="text-2xl font-bold">{soilData.ph}</p>
              <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">pH Level</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auto Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-yellow-500" /> Automation Rules</CardTitle>
          <CardDescription>Configure AI-driven automated watering schedules.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-xl bg-card">
              <div>
                <p className="font-medium">Auto-Watering (Moisture Drop)</p>
                <p className="text-sm text-muted-foreground">Trigger 500L when moisture drops below 30%</p>
              </div>
              <div className="relative inline-block w-12 h-6 rounded-full bg-primary/20">
                <div className="absolute top-1 left-7 w-4 h-4 bg-primary rounded-full transition-transform"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/30 opacity-60">
              <div>
                <p className="font-medium">Rain Delay</p>
                <p className="text-sm text-muted-foreground">Pause irrigation if 10mm rain expected within 24h</p>
              </div>
              <div className="relative inline-block w-12 h-6 rounded-full bg-muted-foreground/30">
                <div className="absolute top-1 left-1 w-4 h-4 bg-background rounded-full transition-transform"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
