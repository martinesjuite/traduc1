import React from 'react';
import { Hash, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface TextElement {
  id: string;
  text: string;
  isTitle: boolean;
  number?: number;
  titleNumber?: number;
  visible: boolean;
  applied?: boolean;
}

interface OutlinePanelProps {
  textBlocks: TextElement[];
  onScrollToBlock: (blockId: string) => void;
  collapsedTitles: Set<string>;
  selectedParagraphs: Set<string>;
  onToggleParagraphSelection: (paragraphId: string) => void;
}

const OutlinePanel: React.FC<OutlinePanelProps> = ({ 
  textBlocks, 
  onScrollToBlock, 
  collapsedTitles,
  selectedParagraphs,
  onToggleParagraphSelection
}) => {
  const getAssociatedParagraphs = (titleIndex: number) => {
    const paragraphs = [];
    for (let i = titleIndex + 1; i < textBlocks.length; i++) {
      if (textBlocks[i].isTitle) break;
      paragraphs.push(textBlocks[i]);
    }
    return paragraphs;
  };

  const renderOutlineItems = () => {
    const items = [];
    let currentTitleIndex = -1;

    textBlocks.forEach((block, index) => {
      if (block.isTitle) {
        currentTitleIndex = index;
        const isCollapsed = collapsedTitles.has(block.id);
        const associatedParagraphs = getAssociatedParagraphs(index);
        
        items.push(
          <div key={block.id} className="mb-2">
            {/* Title Item */}
            <div
              className="flex items-center gap-2 p-2 rounded-md hover:bg-blue-100 cursor-pointer transition-colors"
              onClick={() => onScrollToBlock(block.id)}
            >
              <div className="flex items-center gap-1 flex-shrink-0">
                {isCollapsed ? (
                  <ChevronRight className="w-3 h-3 text-amber-600" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-amber-600" />
                )}
                <Hash className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="font-semibold text-sm text-amber-800 truncate">
                  Título {block.titleNumber}
                </div>
                <div className="text-xs text-amber-600 truncate">
                  {block.text.slice(0, 40)}{block.text.length > 40 ? '...' : ''}
                </div>
              </div>
            </div>

            {/* Associated Paragraphs (only show if not collapsed) */}
            {!isCollapsed && associatedParagraphs.map((paragraph) => (
              <div
                key={paragraph.id}
                className={`ml-6 flex items-center gap-2 p-1 rounded-md hover:bg-blue-50 cursor-pointer transition-colors ${
                  selectedParagraphs.has(paragraph.id) ? 'bg-blue-100 ring-1 ring-blue-300' : ''
                } ${
                  paragraph.applied ? 'bg-green-50 ring-1 ring-green-300' : ''
                }`}
                onClick={() => onScrollToBlock(paragraph.id)}
              >
                <Checkbox 
                  className="flex-shrink-0" 
                  checked={selectedParagraphs.has(paragraph.id)}
                  onCheckedChange={(checked) => {
                    onToggleParagraphSelection(paragraph.id);
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
                <FileText className={`w-3 h-3 flex-shrink-0 ${paragraph.applied ? 'text-green-600' : 'text-blue-600'}`} />
                <div className="flex-1 min-w-0 overflow-hidden">
                  <div className={`text-xs truncate ${paragraph.applied ? 'text-green-700' : 'text-blue-700'}`}>
                    Párrafo {paragraph.number} ({paragraph.text.length} caracteres)
                    {paragraph.applied && <span className="ml-1 text-green-600">✓</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      } else if (currentTitleIndex === -1) {
        // Standalone paragraph (not under any title)
        items.push(
          <div
            key={block.id}
            className={`flex items-center gap-2 p-2 rounded-md hover:bg-blue-50 cursor-pointer transition-colors mb-1 ${
              selectedParagraphs.has(block.id) ? 'bg-blue-100 ring-1 ring-blue-300' : ''
            } ${
              block.applied ? 'bg-green-50 ring-1 ring-green-300' : ''
            }`}
            onClick={() => onScrollToBlock(block.id)}
          >
            <Checkbox 
              className="flex-shrink-0" 
              checked={selectedParagraphs.has(block.id)}
              onCheckedChange={(checked) => {
                onToggleParagraphSelection(block.id);
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <FileText className={`w-4 h-4 flex-shrink-0 ${block.applied ? 'text-green-600' : 'text-blue-600'}`} />
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className={`text-sm truncate ${block.applied ? 'text-green-700' : 'text-blue-700'}`}>
                Párrafo {block.number}
                {block.applied && <span className="ml-1 text-green-600">✓</span>}
              </div>
              <div className="text-xs text-blue-500 truncate">
                {block.text.length} caracteres
              </div>
            </div>
          </div>
        );
      }
    });

    return items;
  };

  return (
    <Card className="h-full flex flex-col shadow-lg border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
      <div className="flex items-center gap-2 p-4 pb-2 flex-shrink-0">
        <Hash className="w-5 h-5 text-gray-700" />
        <h2 className="text-lg font-semibold text-gray-800">Vista General</h2>
        {selectedParagraphs.size > 0 && (
          <div className="ml-auto bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            {selectedParagraphs.size} seleccionados
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-4 pb-4">
          <div className="space-y-1">
            {textBlocks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Hash className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Sin contenido</p>
              </div>
            ) : (
              renderOutlineItems()
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OutlinePanel;
