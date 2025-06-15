
import React, { useState } from 'react';
import { Send, Settings, ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';
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
        totalCharacters: appliedContent.length
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      const responseText = await response.text();
      let formattedResponse = '';

      try {
        const jsonResponse = JSON.parse(responseText);
        formattedResponse = JSON.stringify(jsonResponse, null, 2);
      } catch (e) {
        formattedResponse = responseText;
      }

      setResponse(formattedResponse);

      if (response.ok) {
        toast({
          title: "Éxito",
          description: `Petición enviada correctamente. ${appliedParagraphs.length} párrafos procesados.`
        });
      } else {
        toast({
          title: "Advertencia",
          description: `La API respondió con código ${response.status}`,
          variant: "destructive"
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setResponse(`Error: ${errorMessage}`);
      toast({
        title: "Error",
        description: `Error al hacer la petición: ${errorMessage}`,
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
            {/* API Configuration */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="api-url" className="text-sm font-medium">URL de la API</Label>
                <Input
                  id="api-url"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://api.ejemplo.com/procesar"
                  className="mt-1"
                />
              </div>

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
                  Enviar a API
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
                  className="h-32 font-mono text-sm bg-muted"
                />
              </div>
            )}

            {/* Help Text */}
            <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-md">
              <p className="mb-1"><strong>Cómo usar:</strong></p>
              <p>1. Selecciona párrafos y presiona "Aplicar" para marcarlos</p>
              <p>2. Configura la URL de tu API y headers si es necesario</p>
              <p>3. Los párrafos aplicados se enviarán automáticamente en formato JSON</p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default ApiPanel;
