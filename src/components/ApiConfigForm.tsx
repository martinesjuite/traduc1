
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface ApiConfigFormProps {
  apiUrl: string;
  setApiUrl: (url: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  customHeaders: string;
  setCustomHeaders: (headers: string) => void;
  requestMethod: string;
  setRequestMethod: (method: string) => void;
}

const ApiConfigForm: React.FC<ApiConfigFormProps> = ({
  apiUrl,
  setApiUrl,
  apiKey,
  setApiKey,
  customHeaders,
  setCustomHeaders,
  requestMethod,
  setRequestMethod
}) => {
  const testWithHttpbin = () => {
    setApiUrl('https://httpbin.org/post');
    toast({
      title: "URL de prueba configurada",
      description: "httpbin.org es perfecto para probar peticiones API"
    });
  };

  return (
    <div className="space-y-4">
      {/* CORS Warning */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div className="text-sm text-amber-800 dark:text-amber-200">
          <p className="font-medium mb-1">Problemas comunes de CORS:</p>
          <p>Si obtienes "Failed to fetch", la API debe permitir peticiones desde este dominio.</p>
        </div>
      </div>

      {/* API Configuration */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="api-url" className="text-sm font-medium">URL de la API</Label>
            <Input
              id="api-url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.ejemplo.com/procesar"
              className="mt-1"
            />
          </div>
          <div className="w-24 pt-6">
            <select
              value={requestMethod}
              onChange={(e) => setRequestMethod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-background text-foreground"
            >
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="GET">GET</option>
            </select>
          </div>
        </div>

        <Button onClick={testWithHttpbin} variant="outline" size="sm" className="gap-2">
          🧪 Usar httpbin.org para pruebas
        </Button>

        <div>
          <Label htmlFor="api-key" className="text-sm font-medium">API Key (opcional)</Label>
          <Input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Tu API key"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="headers" className="text-sm font-medium">Headers personalizados (JSON)</Label>
          <Textarea
            id="headers"
            value={customHeaders}
            onChange={(e) => setCustomHeaders(e.target.value)}
            placeholder='{"Content-Type": "application/json"}'
            className="mt-1 h-20 font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default ApiConfigForm;
