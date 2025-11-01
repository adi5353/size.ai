import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Monitor, Server, Network, Shield, Cloud, HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export const DeviceInventory = ({ devices, updateDevice }) => {
  const [customEpsMode, setCustomEpsMode] = useState({});

  const DeviceInput = ({ deviceType, label, tooltip, defaultEps }) => {
    // Local state for input values to allow smooth typing
    const [localQuantity, setLocalQuantity] = useState(devices[deviceType].quantity);
    const [localEps, setLocalEps] = useState(devices[deviceType].eps);

    // Sync with parent state when device changes externally
    useEffect(() => {
      setLocalQuantity(devices[deviceType].quantity);
    }, [devices[deviceType].quantity]);

    useEffect(() => {
      setLocalEps(devices[deviceType].eps);
    }, [devices[deviceType].eps]);

    const handleQuantityChange = (e) => {
      const value = e.target.value;
      setLocalQuantity(value); // Keep as string while typing
      
      // Update parent state with parsed value
      if (value === '') {
        updateDevice(deviceType, 'quantity', 0);
      } else {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue >= 0) {
          updateDevice(deviceType, 'quantity', numValue);
        }
      }
    };

    const handleEpsChange = (e) => {
      const value = e.target.value;
      setLocalEps(value); // Keep as string while typing
      
      // Update parent state with parsed value
      if (value === '') {
        updateDevice(deviceType, 'eps', 0);
      } else {
        const numValue = parseInt(value, 10);
        if (!isNaN(numValue) && numValue >= 0) {
          updateDevice(deviceType, 'eps', numValue);
        }
      }
    };

    const handleQuantityBlur = () => {
      // Ensure we have a valid number on blur
      const numValue = parseInt(localQuantity, 10);
      if (isNaN(numValue) || numValue < 0) {
        setLocalQuantity(0);
        updateDevice(deviceType, 'quantity', 0);
      }
    };

    const handleEpsBlur = () => {
      // Ensure we have a valid number on blur
      const numValue = parseInt(localEps, 10);
      if (isNaN(numValue) || numValue < 0) {
        setLocalEps(0);
        updateDevice(deviceType, 'eps', 0);
      }
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Label className="text-sm font-medium">{label}</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">{tooltip}</p>
                  <p className="text-xs text-muted-foreground mt-1">Default: {defaultEps} EPS</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              type="number"
              min="0"
              value={localQuantity}
              onChange={handleQuantityChange}
              onBlur={handleQuantityBlur}
              placeholder="Quantity"
              className="bg-secondary/50 border-border/50 focus:border-primary transition-colors"
            />
          </div>
          <div className="relative">
            <Input
              type="number"
              min="0"
              step="1"
              value={localEps}
              onChange={handleEpsChange}
              onBlur={handleEpsBlur}
              onFocus={(e) => e.target.select()}
              placeholder="EPS"
              className="bg-secondary/50 border-border/50 focus:border-primary transition-colors pr-12"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              EPS
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="glass-card p-6 shadow-elegant card-hover">
      <div className="mb-6">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-2">Device Inventory</h2>
        <p className="text-sm text-muted-foreground">Configure your infrastructure components and their event generation rates</p>
      </div>

      <Accordion type="multiple" defaultValue={['endpoints', 'servers', 'network', 'cloud', 'security']} className="space-y-4">
        {/* Endpoints Section */}
        <AccordionItem value="endpoints" className="border border-border/50 rounded-lg px-4 bg-secondary/20">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center space-x-2">
              <Monitor className="w-5 h-5 text-primary" />
              <span className="font-heading font-semibold">Endpoints / Workstations</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <DeviceInput
              deviceType="windowsWorkstations"
              label="Windows Workstations"
              tooltip="Standard Windows desktop endpoints. Generates logs for system events, security events, application logs, and user activity."
              defaultEps={3}
            />
            <DeviceInput
              deviceType="linuxWorkstations"
              label="Linux Workstations"
              tooltip="Linux desktop endpoints. Typically generates fewer logs than Windows systems due to lighter logging by default."
              defaultEps={2}
            />
            <DeviceInput
              deviceType="macWorkstations"
              label="macOS Workstations"
              tooltip="Apple macOS desktop endpoints. Generates system logs, security events, and application logs."
              defaultEps={2}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Servers Section */}
        <AccordionItem value="servers" className="border border-border/50 rounded-lg px-4 bg-secondary/20">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-accent" />
              <span className="font-heading font-semibold">Servers</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <DeviceInput
              deviceType="windowsServers"
              label="Windows Servers"
              tooltip="Windows Server systems (AD, file servers, IIS, etc.). Generates significantly more logs than workstations due to services and user requests."
              defaultEps={20}
            />
            <DeviceInput
              deviceType="linuxServers"
              label="Linux Servers"
              tooltip="Linux/Unix servers (web servers, app servers, etc.). Log volume depends on workload and configured verbosity."
              defaultEps={15}
            />
            <DeviceInput
              deviceType="databaseServers"
              label="Database Servers"
              tooltip="Database systems (SQL Server, MySQL, PostgreSQL, Oracle, etc.). High log volume due to transaction logs, query logs, and audit logs."
              defaultEps={30}
            />
            <DeviceInput
              deviceType="applicationServers"
              label="Application Servers"
              tooltip="Dedicated application servers (Java app servers, .NET, etc.). Generates application logs, transaction logs, and error logs."
              defaultEps={25}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Network Devices Section */}
        <AccordionItem value="network" className="border border-border/50 rounded-lg px-4 bg-secondary/20">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center space-x-2">
              <Network className="w-5 h-5 text-primary" />
              <span className="font-heading font-semibold">Network Devices</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <DeviceInput
              deviceType="firewalls"
              label="Firewalls"
              tooltip="Network firewalls (Palo Alto, Fortinet, Cisco ASA, etc.). Generates connection logs, threat logs, and traffic logs."
              defaultEps={200}
            />
            <DeviceInput
              deviceType="switches"
              label="Switches"
              tooltip="Network switches (Cisco, Juniper, Arista, etc.). Typically lower log volume with port status, spanning tree, and management logs."
              defaultEps={50}
            />
            <DeviceInput
              deviceType="routers"
              label="Routers"
              tooltip="Network routers. Generates routing protocol logs, interface logs, and management logs. Higher volume in busy networks."
              defaultEps={300}
            />
            <DeviceInput
              deviceType="loadBalancers"
              label="Load Balancers"
              tooltip="Application and network load balancers (F5, NGINX, HAProxy, etc.). Logs health checks, traffic distribution, and connection data."
              defaultEps={150}
            />
            <DeviceInput
              deviceType="idsIps"
              label="IDS/IPS Systems"
              tooltip="Intrusion Detection/Prevention Systems (Snort, Suricata, etc.). Very high log volume due to packet inspection and alert generation."
              defaultEps={500}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Cloud Resources Section */}
        <AccordionItem value="cloud" className="border border-border/50 rounded-lg px-4 bg-secondary/20">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center space-x-2">
              <Cloud className="w-5 h-5 text-accent" />
              <span className="font-heading font-semibold">Cloud Resources</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <DeviceInput
              deviceType="awsResources"
              label="AWS Resources"
              tooltip="Amazon Web Services resources (EC2, S3, Lambda, CloudTrail, etc.). Log volume varies by service and API call rate."
              defaultEps={10}
            />
            <DeviceInput
              deviceType="azureResources"
              label="Azure Resources"
              tooltip="Microsoft Azure resources (VMs, Storage, Azure AD, Activity Logs, etc.). Comprehensive logging across all Azure services."
              defaultEps={10}
            />
            <DeviceInput
              deviceType="gcpResources"
              label="GCP Resources"
              tooltip="Google Cloud Platform resources (Compute Engine, Cloud Storage, Cloud Audit Logs, etc.). Detailed audit and activity logging."
              defaultEps={10}
            />
            <DeviceInput
              deviceType="otherCloud"
              label="Other Cloud Providers"
              tooltip="Other cloud providers (IBM Cloud, Oracle Cloud, Digital Ocean, etc.). Log volume depends on services used."
              defaultEps={10}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Security Devices Section */}
        <AccordionItem value="security" className="border border-border/50 rounded-lg px-4 bg-secondary/20">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-heading font-semibold">Security Devices & Agents</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <DeviceInput
              deviceType="siemAgents"
              label="SIEM Agents"
              tooltip="Dedicated SIEM collection agents (Splunk forwarders, Elastic Beats, Wazuh agents, etc.). Log collection and forwarding."
              defaultEps={5}
            />
            <DeviceInput
              deviceType="edrAgents"
              label="EDR Agents"
              tooltip="Endpoint Detection and Response agents (CrowdStrike, SentinelOne, Carbon Black, etc.). Higher EPS due to behavioral monitoring."
              defaultEps={15}
            />
            <DeviceInput
              deviceType="webAppFirewalls"
              label="Web Application Firewalls"
              tooltip="WAF devices (AWS WAF, Cloudflare, Imperva, etc.). Logs HTTP/HTTPS traffic, attacks, and rule violations."
              defaultEps={100}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

export default DeviceInventory;
