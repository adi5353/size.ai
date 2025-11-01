import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Settings, Calendar, TrendingUp, Zap, Archive } from 'lucide-react';
import { motion } from 'framer-motion';

export const ConfigurationPanel = ({ configuration, updateConfiguration }) => {
  return (
    <Card className="glass-card p-6 shadow-elegant card-hover">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Settings className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-heading font-bold text-foreground">Configuration Options</h2>
        </div>
        <p className="text-sm text-muted-foreground">Fine-tune your SIEM/XDR infrastructure parameters</p>
      </div>

      <div className="space-y-6">
        {/* Retention Period */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span>Retention Period</span>
            </Label>
            <span className="text-sm font-semibold text-accent">{configuration.retentionPeriod} days</span>
          </div>
          <Select 
            value={configuration.retentionPeriod.toString()} 
            onValueChange={(value) => updateConfiguration('retentionPeriod', parseInt(value))}
          >
            <SelectTrigger className="bg-secondary/50 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
              <SelectItem value="180">180 days</SelectItem>
              <SelectItem value="365">365 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Hot Storage Duration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <Zap className="w-4 h-4 text-accent" />
              <span>Hot Storage Duration</span>
            </Label>
            <span className="text-sm font-semibold text-accent">{configuration.hotStorage} days</span>
          </div>
          <Slider
            value={[configuration.hotStorage]}
            onValueChange={([value]) => updateConfiguration('hotStorage', value)}
            min={7}
            max={Math.min(90, configuration.retentionPeriod)}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>7 days</span>
            <span>{Math.min(90, configuration.retentionPeriod)} days</span>
          </div>
        </div>

        {/* Cold Storage */}
        <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Archive className="w-4 h-4 text-muted-foreground" />
              <Label className="text-sm font-medium">Cold Storage Duration</Label>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {configuration.retentionPeriod - configuration.hotStorage} days
            </span>
          </div>
        </div>

        {/* Growth Factor */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>Annual Growth Factor</span>
            </Label>
            <span className="text-sm font-semibold text-accent">{configuration.growthFactor}%</span>
          </div>
          <Slider
            value={[configuration.growthFactor]}
            onValueChange={([value]) => updateConfiguration('growthFactor', value)}
            min={0}
            max={50}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
          </div>
        </div>

        {/* Peak Factor */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <Zap className="w-4 h-4 text-accent" />
              <span>Peak Load Multiplier</span>
            </Label>
            <span className="text-sm font-semibold text-accent">{configuration.peakFactor}x</span>
          </div>
          <Slider
            value={[configuration.peakFactor]}
            onValueChange={([value]) => updateConfiguration('peakFactor', value)}
            min={1.5}
            max={3}
            step={0.1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1.5x</span>
            <span>3x</span>
          </div>
        </div>

        {/* Compression Ratio */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <Archive className="w-4 h-4 text-muted-foreground" />
              <span>Compression Ratio</span>
            </Label>
            <span className="text-sm font-semibold text-accent">{configuration.compressionRatio}:1</span>
          </div>
          <Slider
            value={[configuration.compressionRatio]}
            onValueChange={([value]) => updateConfiguration('compressionRatio', value)}
            min={2}
            max={10}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>2:1</span>
            <span>10:1</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ConfigurationPanel;