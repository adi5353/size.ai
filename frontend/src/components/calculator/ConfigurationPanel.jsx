import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Settings, Calendar, TrendingUp, Archive, Shield, Zap } from 'lucide-react';
import { toast } from 'sonner';

export const ConfigurationPanel = ({ configuration, updateConfiguration, applyComplianceTemplate }) => {
  
  const handleTemplateApply = (template) => {
    applyComplianceTemplate(template);
    const templateNames = {
      'pci-dss': 'PCI-DSS',
      'hipaa': 'HIPAA',
      'gdpr': 'GDPR',
      'soc2': 'SOC 2',
    };
    if (templateNames[template]) {
      toast.success(`${templateNames[template]} template applied`, {
        description: 'Configuration updated with compliance requirements',
      });
    }
  };

  return (
    <Card className="glass-card p-6 shadow-elegant card-hover">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Settings className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-heading font-bold text-foreground\">Configuration Options</h2>
        </div>
        <p className="text-sm text-muted-foreground">Fine-tune your SIEM/XDR infrastructure parameters</p>
      </div>

      <div className="space-y-6">
        {/* Compliance Templates */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center space-x-2">
            <Shield className="w-4 h-4 text-primary" />
            <span>Compliance Template (Quick Fill)</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={configuration.complianceTemplate === 'pci-dss' ? 'default' : 'outline'}
              onClick={() => handleTemplateApply('pci-dss')}
              className="w-full"
              size="sm"
            >
              PCI-DSS
            </Button>
            <Button
              variant={configuration.complianceTemplate === 'hipaa' ? 'default' : 'outline'}
              onClick={() => handleTemplateApply('hipaa')}
              className="w-full"
              size="sm"
            >
              HIPAA
            </Button>
            <Button
              variant={configuration.complianceTemplate === 'gdpr' ? 'default' : 'outline'}
              onClick={() => handleTemplateApply('gdpr')}
              className="w-full"
              size="sm"
            >
              GDPR
            </Button>
            <Button
              variant={configuration.complianceTemplate === 'soc2' ? 'default' : 'outline'}
              onClick={() => handleTemplateApply('soc2')}
              className="w-full"
              size="sm"
            >
              SOC 2
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Quick apply industry-standard compliance configurations</p>
        </div>

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
              <SelectItem value="30">30 days (Basic)</SelectItem>
              <SelectItem value="90">90 days (Standard - PCI-DSS)</SelectItem>
              <SelectItem value="180">180 days (Enhanced - GDPR)</SelectItem>
              <SelectItem value="365">365 days (Compliance - HIPAA/SOC2)</SelectItem>
              <SelectItem value="730">730 days (2 years)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Replication Factor */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Index Replication Factor</Label>
            <span className="text-sm font-semibold text-accent">{configuration.replicationFactor}x</span>
          </div>
          <Select 
            value={configuration.replicationFactor.toString()} 
            onValueChange={(value) => updateConfiguration('replicationFactor', parseInt(value))}
          >
            <SelectTrigger className="bg-secondary/50 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1x (No Replication)</SelectItem>
              <SelectItem value="2">2x (Standard HA)</SelectItem>
              <SelectItem value="3">3x (High Durability)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Replication ensures data durability and high availability</p>
        </div>

        {/* Compression Level */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <Archive className="w-4 h-4 text-muted-foreground" />
              <span>Compression Estimate</span>
            </Label>
            <span className="text-sm font-semibold text-accent">
              {configuration.compressionLevel === 'none' ? 'None' : 
               configuration.compressionLevel === 'standard' ? '40%' : '60%'}
            </span>
          </div>
          <Select 
            value={configuration.compressionLevel} 
            onValueChange={(value) => updateConfiguration('compressionLevel', value)}
          >
            <SelectTrigger className="bg-secondary/50 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (No Compression)</SelectItem>
              <SelectItem value="standard">Standard (40% compression)</SelectItem>
              <SelectItem value="high">High (60% compression)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Compression reduces storage costs significantly</p>
        </div>

        {/* Hot/Cold Storage Split */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <Zap className="w-4 h-4 text-accent" />
              <span>Hot/Cold Storage Split</span>
            </Label>
            <Switch
              checked={configuration.hotColdSplit}
              onCheckedChange={(checked) => updateConfiguration('hotColdSplit', checked)}
            />
          </div>
          {configuration.hotColdSplit && (
            <div className="space-y-3 pl-6 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Hot Storage Duration</Label>
                <span className="text-sm font-semibold text-accent">{configuration.hotStorageDays} days</span>
              </div>
              <Slider
                value={[configuration.hotStorageDays]}
                onValueChange={([value]) => updateConfiguration('hotStorageDays', value)}
                min={7}
                max={Math.min(90, configuration.retentionPeriod)}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>7 days</span>
                <span>{Math.min(90, configuration.retentionPeriod)} days</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Cold storage: {configuration.retentionPeriod - configuration.hotStorageDays} days
              </p>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Split storage tiers to optimize costs (hot=fast, cold=archive)
          </p>
        </div>

        {/* Growth Planning */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>Include Growth Projections</span>
            </Label>
            <Switch
              checked={configuration.includeGrowth}
              onCheckedChange={(checked) => updateConfiguration('includeGrowth', checked)}
            />
          </div>
          {configuration.includeGrowth && (
            <div className="space-y-3 pl-6 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Expected Annual Growth</Label>
                <span className="text-sm font-semibold text-accent">{configuration.annualGrowth}%</span>
              </div>
              <Slider
                value={[configuration.annualGrowth]}
                onValueChange={([value]) => updateConfiguration('annualGrowth', value)}
                min={0}
                max={50}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Plan for future infrastructure needs (1-3 year projections)
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ConfigurationPanel;
