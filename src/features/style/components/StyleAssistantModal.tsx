import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FunctionDeclaration, Type, Content } from '@google/genai';
import { ai } from '../../../core/api/ai';
import { ICONS } from '../../../core/components/IconButton';
import { Modal } from '../../../core/components/Modal';
import { Select } from '../../../core/components/Select';
import type { Product, StylePreset } from '../../../core/types';

const deletePresetTool: FunctionDeclaration = {
    name: 'deleteStylePreset',
    parameters: {
        type: Type.OBJECT,
        description: 'Deletes a style preset from the user\'s library.',
        properties: {
            presetName: {
                type: Type.STRING,
                description: 'The exact name of the style preset to delete.',
            },
        },
        required: ['presetName'],
    },
};

const listPresetsTool: FunctionDeclaration = {
    name: 'listStylePresets',
    parameters: {
        type: Type.OBJECT,
        description: 'Lists all available style presets in the user\'s library.',
        properties: {},
    }
}

export const StyleAssistantModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (presets: Omit<StylePreset, 'id'>[], contextSubject?: string) => void;
    products: Product[];
    stylePresets: StylePreset[];
    onDeletePreset: (id: string) => void;
    deductCredits: (amount: number) => boolean;
    CREDIT_COSTS: { PROMPT_IDEAS: number };
}> = ({ isOpen, onClose, onSave, products, stylePresets, onDeletePreset, deductCredits, CREDIT_COSTS }) => {
    const [history, setHistory] = useState<Content[]>([]);
    const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedPresets, setGeneratedPresets] = useState<Omit<StylePreset, 'id'>[]>([]);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const selectedProduct = useMemo(() => products.find(p => p.id === selectedProductId), [products, selectedProductId]);

    const systemInstruction = `You are an expert AI creative director and workspace assistant. Your goal is to help a user create a diverse set of style presets for their product photography and manage their workspace.

**You have two primary modes:**

**1. Creative Brainstorming & Style Generation:**
   - Engage in a conversation to understand the user's vision. Ask clarifying questions about their brand, target audience, and desired aesthetic.
   - Once you have a clear idea, confirm with the user that you are ready to generate some styles.
   - When generating styles, your FINAL response MUST be ONLY a raw JSON object (no markdown, no other text) with a "stylePresets" key.
   - The "stylePresets" value must be an array of 2 to 5 distinct and creative style preset objects based on the conversation. The quantity should depend on the richness of the user's request.
   - Each preset object MUST include:
     - "name" (string): A unique, creative name for the style.
     - "prompt" (object): A detailed modular prompt.
   - The modular prompt's "productDetails" field must contain generic placeholders like 'The product, rendered in hyper-realistic detail'.
   - Do NOT include "referenceImages" in the generated objects.

**2. Workspace Management:**
   - You can interact with the user's workspace using available tools.
   - When a user asks to perform an action like "delete the 'Sunset' preset" or "show me my styles", call the appropriate function.
   - After the function is executed, provide a friendly confirmation message to the user based on the tool's result.

**Available Tools:**
- \`listStylePresets\`: Shows all style presets in the library.
- \`deleteStylePreset\`: Deletes a specific style preset by its name.`;


    useEffect(() => {
        if (!isOpen) {
            setSelectedProductId(null);
            setGeneratedPresets([]);
            setMessages([]);
            setHistory([]);
            setIsLoading(false);
        }
    }, [isOpen]);


    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (selectedProduct) {
            setHistory([]);
            setMessages([
                { role: 'model', text: `Hello! I'm your AI Style Assistant. I can help you brainstorm new styles or manage your existing library. To start, tell me about the kind of images you want to create for '${selectedProduct.name}'.` }
            ]);
            setGeneratedPresets([]);
        } else {
            setHistory([]);
            setMessages([]);
            setGeneratedPresets([]);
        }
    }, [selectedProduct]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        if (!deductCredits(CREDIT_COSTS.PROMPT_IDEAS)) {
            return;
        }
    
        const userMessageText = userInput;
        const userContent: Content = { role: 'user', parts: [{ text: userMessageText }] };
    
        setMessages(prev => [...prev, { role: 'user', text: userMessageText }]);
        setUserInput('');
        setIsLoading(true);
    
        try {
            const currentHistory = [...history, userContent];
    
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: currentHistory,
                config: {
                    systemInstruction,
                    tools: [{ functionDeclarations: [deletePresetTool, listPresetsTool] }],
                },
            });
    
            const modelResponse = response.candidates[0].content;
            
            if (response.functionCalls && response.functionCalls.length > 0) {
                const functionResponseParts = [];
                for (const fc of response.functionCalls) {
                    let functionResponseResult;
                    if (fc.name === 'deleteStylePreset') {
                        const presetName = fc.args.presetName as string;
                        const presetToDelete = stylePresets.find(p => (p.name || '').toLowerCase() === (presetName || '').toLowerCase());
                        if (presetToDelete) {
                            onDeletePreset(presetToDelete.id);
                            functionResponseResult = { result: `Successfully deleted preset: ${presetName}` };
                        } else {
                            functionResponseResult = { result: `Error: Could not find a preset named ${presetName}` };
                        }
                    } else if (fc.name === 'listStylePresets') {
                         const presetNames = stylePresets.map(p => p.name).join(', ');
                         const resultText = presetNames.length > 0 ? `Available presets: ${presetNames}` : 'There are no presets in your library.';
                         functionResponseResult = { result: resultText };
                    }
    
                    if (functionResponseResult) {
                         functionResponseParts.push({
                             functionResponse: {
                                 name: fc.name,
                                 response: functionResponseResult,
                             }
                         });
                    }
                }
                
                if (functionResponseParts.length > 0) {
                    const functionContent: Content = { role: 'function', parts: functionResponseParts };
                    const historyWithToolResponse = [...currentHistory, modelResponse, functionContent];

                    const finalApiResponse = await ai.models.generateContent({
                        model: 'gemini-2.5-flash',
                        contents: historyWithToolResponse,
                        config: {
                            systemInstruction,
                            tools: [{ functionDeclarations: [deletePresetTool, listPresetsTool] }],
                        },
                    });
                    
                    const finalModelResponse = finalApiResponse.candidates[0].content;
                    setHistory([...historyWithToolResponse, finalModelResponse]);
                    setMessages(prev => [...prev, { role: 'model', text: finalApiResponse.text }]);
                } else {
                    setHistory([...currentHistory, modelResponse]);
                    setMessages(prev => [...prev, { role: 'model', text: "I tried to use a tool but something went wrong." }]);
                }
    
            } else {
                setHistory([...currentHistory, modelResponse]);
                let modelResponseText = response.text;
                const jsonMatch = modelResponseText.match(/```json\n([\s\S]*?)\n```|({[\s\S]*})/);
                if (jsonMatch) {
                    try {
                        const jsonString = jsonMatch[1] || jsonMatch[2];
                        const parsed = JSON.parse(jsonString);
                        if (parsed.stylePresets && Array.isArray(parsed.stylePresets)) {
                            setGeneratedPresets(parsed.stylePresets.map((p: any) => ({...p, status: 'complete'}))); // No auto-gen
                            modelResponseText = "Here are the style presets I've generated based on our conversation! You can save them to your library.";
                        }
                    } catch (parseError) {
                        console.error("Failed to parse JSON from model response:", parseError);
                    }
                }
                setMessages(prev => [...prev, { role: 'model', text: modelResponseText }]);
            }
    
        } catch (error) {
            console.error("AI chat failed:", error);
            setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleChangeProduct = () => {
        setSelectedProductId(null);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="AI Style Assistant" size="xlarge">
             
            <div className={`style-assistant-view-layout ${selectedProduct ? 'has-product' : ''}`}>
                {!selectedProduct ? (
                     <div className="assistant-setup-panel">
                        <div className="modal-form-group">
                            <h3>Select a Contextual Product to Begin</h3>
                            <Select
                                value={selectedProductId || ''}
                                onChange={setSelectedProductId}
                                options={products.map(p => ({ value: p.id, label: p.name }))}
                                placeholder="Select Product..."
                            />
                        </div>
                     </div>
                ) : (
                    <>
                        <main className="assistant-chat-panel">
                            <div className="chat-messages-container">
                                {messages.map((msg, index) => (
                                    <div key={index} className={`message-bubble ${msg.role === 'user' ? 'message-user' : 'message-model'}`}>
                                        {msg.text}
                                    </div>
                                ))}
                                {isLoading && <div className="message-bubble message-model">Thinking...</div>}
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className="chat-input-area">
                                <input
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    placeholder="e.g., 'Let's create some moody, cinematic styles.'"
                                    disabled={isLoading}
                                />
                                <button type="submit" disabled={isLoading || !userInput.trim()}>
                                    <div className="icon">{ICONS.send}</div>
                                </button>
                            </form>
                        </main>
                        <aside className="assistant-results-panel">
                            <h3>Generated Presets</h3>
                            {generatedPresets.length > 0 ? (
                                <>
                                    <div className="assistant-presets-grid">
                                        {generatedPresets.map((preset, index) => (
                                            <div key={index} className="preset-card">
                                                <div className="preset-card-info">
                                                    <h4>{preset.name}</h4>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => onSave(generatedPresets, selectedProduct?.name)} className="save-presets-button button-primary">Save {generatedPresets.length} Presets to Library</button>
                                </>
                            ) : (
                                <div className="empty-state-small">Presets generated by the AI will appear here after your conversation.</div>
                            )}
                             <button style={{width: '100%'}} onClick={handleChangeProduct}>Change Product</button>
                        </aside>
                    </>
                )}
            </div>
        </Modal>
    );
};