import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Store, Tractor, MapPin, Phone } from 'lucide-react';

export const Marketplace = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
        <p className="text-muted-foreground mt-1">Buy, sell crops, or rent heavy equipment directly from your community.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Crop Market */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold flex items-center gap-2"><Store className="h-6 w-6 text-primary" /> Crops for Sale</h2>
            <Button size="sm">List Crop</Button>
          </div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={`crop-${i}`} className="overflow-hidden hover:shadow-md transition-all group">
                <div className="flex flex-col sm:flex-row h-full">
                  <div className="w-full sm:w-40 h-40 sm:h-auto bg-muted">
                    <img 
                      src={`https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=600&auto=format&fit=crop&sig=${i}`} 
                      alt="Crop" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg">Premium Wheat (Sharbati)</h3>
                        <span className="font-bold text-primary text-lg">$450 / Ton</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Punjab, India • 5 Tons available
                      </p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button variant="outline" className="w-full text-xs h-8"><Phone className="h-3 w-3 mr-2" /> Contact Seller</Button>
                      <Button className="w-full text-xs h-8">Buy Now</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Equipment Rentals */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold flex items-center gap-2"><Tractor className="h-6 w-6 text-orange-500" /> Equipment Rental</h2>
            <Button size="sm" variant="outline">List Equipment</Button>
          </div>
          <div className="grid gap-4">
            {[1, 2].map((i) => (
              <Card key={`rent-${i}`} className="overflow-hidden hover:shadow-md transition-all group">
                <div className="flex flex-col sm:flex-row h-full">
                  <div className="w-full sm:w-40 h-40 sm:h-auto bg-muted">
                    <img 
                      src={`https://images.unsplash.com/photo-1592982537447-6f2a6a0a0122?q=80&w=600&auto=format&fit=crop&sig=${i+5}`} 
                      alt="Tractor" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg">John Deere 5050D</h3>
                        <span className="font-bold text-orange-500 text-lg">$45 / Day</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Haryana, India • Available
                      </p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button className="w-full text-xs h-8 bg-orange-500 hover:bg-orange-600">Book Dates</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
