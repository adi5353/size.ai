import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Monitor, Server, Network, Shield, Cloud } from 'lucide-react';
import { motion } from 'framer-motion';

export const DeviceInventory = ({ devices, updateDevice }) => {
  const renderDeviceInput = (deviceType, label, icon, epsOptions = null) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center space-x-2">
          {icon}
          <span>{label}</span>
        </Label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Input
            type="number"
            min="0"
            value={devices[deviceType].quantity}
            onChange={(e) => updateDevice(deviceType, 'quantity', parseInt(e.target.value) || 0)}
            placeholder="Quantity"
            className="bg-secondary/50 border-border/50 focus:border-primary transition-colors"
          />
        </div>
        <div>
          {epsOptions ? (
            <Select 
              value={devices[deviceType].eps.toString()} 
              onValueChange={(value) => updateDevice(deviceType, 'eps', parseInt(value))}
            >
              <SelectTrigger className="bg-secondary/50 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {epsOptions.map(eps => (
                  <SelectItem key={eps} value={eps.toString()}>{eps} EPS</SelectItem>
                ))}
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Input
              type="number"
              min="0"
              value={devices[deviceType].eps}
              onChange={(e) => updateDevice(deviceType, 'eps', parseInt(e.target.value) || 0)}
              placeholder="EPS"
              className="bg-secondary/50 border-border/50 focus:border-primary transition-colors"
            />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Card className="glass-card p-6 shadow-elegant card-hover">
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Device Inventory</h2>
        <p className="text-sm text-muted-foreground">Configure your infrastructure components and their event generation rates</p>
      </div>

      <Accordion type="multiple" defaultValue={['endpoints', 'network', 'security', 'cloud']} className="space-y-4">
        {/* Endpoints & Servers */}
        <AccordionItem value="endpoints" className="border border-border/50 rounded-lg px-4 bg-secondary/20">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center space-x-2">
              <Monitor className="w-5 h-5 text-primary" />
              <span className="font-heading font-semibold">Endpoints & Servers</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            {renderDeviceInput('endpoints', 'Workstations/Endpoints', <Monitor className="w-4 h-4 text-muted-foreground" />, [1, 2, 3, 4, 5])}
            {renderDeviceInput('servers', 'Servers (Windows/Linux/Unix)', <Server className="w-4 h-4 text-muted-foreground" />, [5, 10, 15, 20])}
          </AccordionContent>
        </AccordionItem>

        {/* Network Devices */}
        <AccordionItem value="network" className="border border-border/50 rounded-lg px-4 bg-secondary/20">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center space-x-2">
              <Network className="w-5 h-5 text-accent" />
              <span className="font-heading font-semibold">Network Devices</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            {renderDeviceInput('routers', 'Routers', <Network className="w-4 h-4 text-muted-foreground" />)}
            {renderDeviceInput('switches', 'Switches', <Network className="w-4 h-4 text-muted-foreground" />)}
            {renderDeviceInput('firewalls', 'Firewalls', <Shield className="w-4 h-4 text-muted-foreground" />)}
            {renderDeviceInput('loadBalancers', 'Load Balancers', <Network className="w-4 h-4 text-muted-foreground" />)}
          </AccordionContent>
        </AccordionItem>

        {/* Security Devices */}
        <AccordionItem value="security" className="border border-border/50 rounded-lg px-4 bg-secondary/20">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-heading font-semibold">Security Devices</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            {renderDeviceInput('ids', 'IDS/IPS', <Shield className="w-4 h-4 text-muted-foreground" />)}
            {renderDeviceInput('waf', 'Web Application Firewalls', <Shield className="w-4 h-4 text-muted-foreground" />)}
            {renderDeviceInput('emailGateways', 'Email Gateways', <Shield className="w-4 h-4 text-muted-foreground" />)}
            {renderDeviceInput('proxyServers', 'Proxy Servers', <Shield className="w-4 h-4 text-muted-foreground" />)}
          </AccordionContent>
        </AccordionItem>

        {/* Cloud & Applications */}
        <AccordionItem value="cloud" className="border border-border/50 rounded-lg px-4 bg-secondary/20">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center space-x-2">
              <Cloud className="w-5 h-5 text-accent" />
              <span className="font-heading font-semibold">Cloud & Applications</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            {renderDeviceInput('cloudServices', 'Cloud Services (AWS/Azure/GCP)', <Cloud className="w-4 h-4 text-muted-foreground" />)}
            {renderDeviceInput('saasApps', 'SaaS Applications', <Cloud className="w-4 h-4 text-muted-foreground" />)}
            {renderDeviceInput('databases', 'Databases', <Server className="w-4 h-4 text-muted-foreground" />)}
            {renderDeviceInput('customSources', 'Custom Log Sources', <Monitor className="w-4 h-4 text-muted-foreground" />)}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

export default DeviceInventory;