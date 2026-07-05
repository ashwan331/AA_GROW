import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { UploadCloud, CheckCircle, AlertTriangle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const DiseaseDetection = () => {
  const [image, setImage] = useState<string | null>(null);
  const [cropType, setCropType] = useState('Unknown');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const scanImage = async () => {
    if (!image) return;
    setIsScanning(true);
    setError('');

    try {
      const token = localStorage.getItem('aa_grow_token');
      const res = await fetch(`${API_BASE}/api/disease`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ base64Image: image, crop_type: cropType })
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Scan failed');

      setResult(data.scan);
    } catch (err: any) {
      setError(err.message || 'Failed to scan image. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Disease Detection</h1>
        <p className="text-muted-foreground mt-1">Upload a photo of an infected crop leaf to get instant AI diagnosis.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="h-[500px] flex flex-col">
          <CardHeader>
            <CardTitle>Image Upload</CardTitle>
            <CardDescription>Drag and drop or select an image to scan.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-3 px-6 pb-6">
            {/* Crop type selector */}
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-sm"
            >
              <option value="Unknown">Select Crop Type</option>
              <option value="Tomato">Tomato</option>
              <option value="Wheat">Wheat</option>
              <option value="Rice">Rice</option>
              <option value="Cotton">Cotton</option>
              <option value="Maize">Maize</option>
              <option value="Potato">Potato</option>
              <option value="Sugarcane">Sugarcane</option>
              <option value="Soybean">Soybean</option>
            </select>

            <div className="flex-1 border-2 border-dashed border-border rounded-xl relative overflow-hidden group">
              {image ? (
                <>
                  <img src={image} alt="Crop" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
                  {isScanning && (
                    <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                      <div className="w-full h-1 bg-primary/80 shadow-[0_0_15px_5px_rgba(34,197,94,0.5)] animate-scan absolute top-0"></div>
                      <p className="font-semibold text-lg animate-pulse">Analyzing image...</p>
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4 z-10 flex gap-2">
                    <Button variant="secondary" size="sm" onClick={() => { setImage(null); setResult(null); }}>Clear</Button>
                    <Button onClick={scanImage} disabled={isScanning}>
                      {isScanning ? 'Scanning...' : 'Scan Now'}
                    </Button>
                  </div>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full text-muted-foreground hover:text-foreground transition-colors">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud className="h-8 w-8 text-primary" />
                  </div>
                  <span className="font-medium text-lg">Click to Upload</span>
                  <span className="text-sm">JPG, PNG up to 10MB</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                </label>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
            )}
          </CardContent>
        </Card>

        {result && (
          <Card className="animate-fade-in border-primary/50 shadow-lg h-[500px] flex flex-col overflow-y-auto">
            <CardHeader className="bg-primary/5 border-b pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {result.severity === 'HIGH'
                      ? <AlertTriangle className="h-5 w-5 text-destructive" />
                      : <CheckCircle className="h-5 w-5 text-primary" />}
                    Diagnosis Complete
                  </CardTitle>
                  <CardDescription className="mt-1">
                    AI Confidence: {parseFloat(result.confidence_score).toFixed(1)}%
                  </CardDescription>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  result.severity === 'HIGH'   ? 'bg-destructive/10 text-destructive' :
                  result.severity === 'MEDIUM' ? 'bg-orange-500/10 text-orange-500'  :
                                                  'bg-primary/10 text-primary'
                }`}>
                  {result.severity} SEVERITY
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Crop Type</h3>
                <p className="text-lg font-semibold mt-1">{result.crop_type}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Detected Disease</h3>
                <p className="text-2xl font-bold mt-1 text-foreground">{result.disease_detected}</p>
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Treatment Recommendations</h3>
                <div className="bg-muted/50 p-4 rounded-xl text-sm leading-relaxed border border-border">
                  {result.treatment_recommendations}
                </div>
              </div>
              <div className="pt-2 text-xs text-muted-foreground">
                Scanned on {new Date(result.created_at).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
        .animate-scan { animation: scan 2s linear infinite; }
      `}</style>
    </div>
  );
};
