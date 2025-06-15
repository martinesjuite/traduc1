
import React, { useState } from 'react';
import { Send, Settings, ChevronDown, ChevronRight, Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from '@/hooks/use-toast';

interface TextElement {
  id: string;
  text: string;
  isTitle: boolean;
  number?: number;
  titleNumber?: number;
  visible: boolean;
  applied?: boolean;
  appliedColor?: string;
}

interface ApiPanelProps {
  textBlocks: TextElement[];
}

const ApiPanel: React.FC<ApiPanelProps> = ({ textBlocks }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [customHeaders, setCustomHeaders] = useState('{"Content-Type": "application/json"}');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [copied, setCopied] = useState(false);
  const [requestMethod, setRequestMethod] = useState('POST');

  // Get applied paragraphs
  const appliedParagraphs = textBlocks.filter(block => block.applied && !block.isTitle);
  const appliedContent = appliedParagraphs.map(block => block.text).join('\n\n');

  const handleSendRequest = async () => {
    if (!apiUrl) {
      toast({
        title: "Error",
        description: "Por favor ingresa una URL de API",
        variant: "destructive"
      });
      return;
    }

    if (appliedParagraphs.length === 0) {
      toast({
        title: "Error",
        description: "No hay párrafos aplicados para enviar",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setResponse('');

    try {
      // Parse custom headers
      let headers = {};
      try {
        headers = JSON.parse(customHeaders);
      } catch (e) {
        headers = { "Content-Type": "application/json" };
        toast({
          title: "Advertencia",
          description: "Headers inválidos, usando Content-Type por defecto",
          variant: "destructive"
        });
      }

      // Add API key to headers if provided
      if (apiKey) {
        headers = { ...headers, "Authorization": `Bearer ${apiKey}` };
      }

      const requestBody = {
        content: appliedContent,
        paragraphs: appliedParagraphs.map(p => ({
          id: p.id,
          text: p.text,
          number: p.number
        })),
        totalParagraphs: appliedParagraphs.length,
        totalCharacters: appliedContent.length,
        timestamp: new Date().toISOString()
      };

      console.log('Enviando petición a:', apiUrl);
      console.log('Headers:', headers);
      console.log('Body:', requestBody);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

      const response = await fetch(apiUrl, {
        method: requestMethod,
        headers,
        body: requestMethod !== 'GET' ? JSON.stringify(requestBody) : undefined,
        signal: controller.signal,
        mode: 'cors', // Explicitly set CORS mode
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();
      let formattedResponse = '';

      try {
        const jsonResponse = JSON.parse(responseText);
        formattedResponse = JSON.stringify(jsonResponse, null, 2);
      } catch (e) {
        formattedResponse = responseText;
      }

      // Add response details
      const responseDetails = `Status: ${response.status} ${response.statusText}\n` +
        `Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}\n\n` +
        `Body:\n${formattedResponse}`;

      setResponse(responseDetails);

      if (response.ok) {
        toast({
          title: "Éxito",
          description: `Petición enviada correctamente. ${appliedParagraphs.length} párrafos procesados.`
        });
      } else {
        toast({
          title: "Advertencia",
          description: `La API respondió con código ${response.status}: ${response.statusText}`,
          variant: "destructive"
        });
      }

    } catch (error) {
      let errorMessage = 'Error desconocido';
      let errorDetails = '';

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Timeout: La petición tardó más de 30 segundos';
          errorDetails = 'La API no respondió a tiempo. Verifica que la URL sea correcta y que el servidor esté funcionando.';
        } else if (error.message === 'Failed to fetch') {
          errorMessage = 'Error de conexión (CORS/Red)';
          errorDetails = `Posibles causas:
• La API no permite peticiones desde este dominio (Error CORS)
• La URL no es válida o no existe
• El servidor está caído
• Problemas de conectividad

Soluciones sugeridas:
• Verifica que la URL sea correcta
• Asegúrate de que la API permita peticiones CORS desde tu dominio
• Prueba con una API de prueba como httpbin.org/post
• Contacta al administrador de la API para configurar CORS`;
        } else {
          errorMessage = error.message;
          errorDetails = 'Error inesperado durante la petición';
        }
      }

      const errorResponse = `ERROR: ${errorMessage}\n\nDetalles:\n${errorDetails}\n\nURL intentada: ${apiUrl}\nMétodo: ${requestMethod}`;
      setResponse(errorResponse);
      
      toast({
        title: "Error de conexión",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyResponse = async () => {
    if (response) {
      try {
        await navigator.clipboard.writeText(response);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({
          title: "Copiado",
          description: "Respuesta copiada al portapapeles"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo copiar al portapapeles",
          variant: "destructive"
        });
      }
    }
  };

  const testWithHttpbin = () => {
    setApiUrl('https://httpbin.org/post');
    toast({
      title: "URL de prueba configurada",
      description: "httpbin.org es perfecto para probar peticiones API"
    });
  };

  return (
    <Card className="shadow-lg border bg-card text-card-foreground backdrop-blur-sm">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2">
              <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold">API Request Panel</h2>
              {appliedParagraphs.length > 0 && (
                <div className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                  {appliedParagraphs.length} párrafos listos
                </div>
              )}
            </div>
            {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="p-4 pt-0 space-y-4">
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

            {/* Content Preview */}
            {appliedParagraphs.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Contenido a enviar:</Label>
                <div className="p-3 bg-muted rounded-md max-h-32 overflow-y-auto">
                  <p className="text-sm text-muted-foreground mb-2">
                    {appliedParagraphs.length} párrafos • {appliedContent.length} caracteres
                  </p>
                  <p className="text-sm line-clamp-3">{appliedContent.substring(0, 200)}...</p>
                </div>
              </div>
            )}

            {/* Send Button */}
            <Button 
              onClick={handleSendRequest} 
              disabled={isLoading || appliedParagraphs.length === 0}
              className="w-full gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Enviar a API ({requestMethod})
                </>
              )}
            </Button>

            {/* Response */}
            {response && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Respuesta:</Label>
                  <Button
                    onClick={copyResponse}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </Button>
                </div>
                <Textarea
                  value={response}
                  readOnly
                  className="h-40 font-mono text-sm bg-muted"
                />
              </div>
            )}

            {/* Help Text */}
            <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-md">
              <p className="mb-1"><strong>Cómo usar:</strong></p>
              <p>1. Selecciona párrafos y presiona "Aplicar" para marcarlos</p>
              <p>2. Configura la URL de tu API y headers si es necesario</p>
              <p>3. Los párrafos aplicados se enviarán automáticamente en formato JSON</p>
              <p className="mt-2 text-amber-600 dark:text-amber-400"><strong>💡 Tip:</strong> Si hay errores CORS, contacta al administrador de la API</p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default ApiPanel;
