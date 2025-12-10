import { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { Terminal } from './Terminal';
import { Plus, X, Play } from 'lucide-react';

export const PCDashboard = () => {
    const { selectedPC, refresh } = useSimulation();
    const [newFileName, setNewFileName] = useState('');
    const [newFileContent, setNewFileContent] = useState('');
    const [showCreateFile, setShowCreateFile] = useState(false);
    const [selectedTool, setSelectedTool] = useState<any>(null);
    const [toolArgs, setToolArgs] = useState<Record<string, any>>({});
    const [toolResult, setToolResult] = useState<string>('');

    if (!selectedPC) {
        return (
            <div className="h-full flex items-center justify-center bg-gray-900/50">
                <div className="text-center">
                    <div className="text-6xl mb-4">🖥️</div>
                    <h2 className="text-2xl text-gray-400">Select a computer from the network map</h2>
                </div>
            </div>
        )
    }

    const tools = selectedPC.mcpServer.listTools();

    const handleCreateFile = () => {
        if (!newFileName.trim()) return;
        
        const path = newFileName.startsWith('/') ? newFileName : `/${newFileName}`;
        selectedPC.fs.writeFile(path, newFileContent);
        selectedPC.log(`Created file: ${path}`);
        
        // Reset form
        setNewFileName('');
        setNewFileContent('');
        setShowCreateFile(false);

        // Force UI refresh to show new file
        refresh();
    };

    const handleToolClick = (tool: any) => {
        setSelectedTool(tool);
        setToolArgs({});
        setToolResult('');
    };

    const handleExecuteTool = async () => {
        if (!selectedTool) return;
        
        try {
            const result = await selectedPC.mcpServer.callTool(selectedTool.name, toolArgs);
            setToolResult(result);
            selectedPC.log(`MCP Tool executed: ${selectedTool.name}`);
        } catch (error: any) {
            setToolResult(`Error: ${error.message}`);
        }
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 text-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-800 bg-gray-800/50 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">{selectedPC.hostname}</h1>
                    <p className="text-sm text-gray-400 font-mono">{selectedPC.ip} | {selectedPC.id}</p>
                </div>
                <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">
                    ONLINE
                </div>
            </div>

            {/* Content Split */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Info & MCP */}
                <div className="w-1/3 p-4 border-r border-gray-800 overflow-y-auto bg-gray-900/50">
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold">FileSystem</h3>
                            <button
                                onClick={() => setShowCreateFile(!showCreateFile)}
                                className="px-2 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs rounded flex items-center gap-1 transition-colors"
                            >
                                <Plus className="w-3 h-3" />
                                New File
                            </button>
                        </div>

                        {/* Create File Form */}
                        {showCreateFile && (
                            <div className="bg-gray-800 p-3 mb-3 rounded border border-gray-700">
                                <input
                                    type="text"
                                    placeholder="File path (e.g., /home/test.txt)"
                                    value={newFileName}
                                    onChange={(e) => setNewFileName(e.target.value)}
                                    className="w-full bg-black/50 text-white px-2 py-1 text-xs rounded mb-2 border border-gray-600 focus:border-blue-500 focus:outline-none"
                                />
                                <textarea
                                    placeholder="File content..."
                                    value={newFileContent}
                                    onChange={(e) => setNewFileContent(e.target.value)}
                                    className="w-full bg-black/50 text-white px-2 py-1 text-xs rounded mb-2 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
                                    rows={3}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCreateFile}
                                        disabled={!newFileName.trim()}
                                        className="flex-1 px-2 py-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs rounded transition-colors"
                                    >
                                        Create
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowCreateFile(false);
                                            setNewFileName('');
                                            setNewFileContent('');
                                        }}
                                        className="flex-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="bg-black/50 p-3 font-mono text-xs text-gray-400">
                            {selectedPC.fs.ls('/').map(f => (
                                <div key={f} className="mb-1 flex items-center gap-2">
                                    <span>📄</span> {f}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3 font-bold">
                            Available MCP Tools ({tools.length})
                        </h3>
                        <div className="space-y-2">
                            {tools.map(tool => (
                                <div 
                                    key={tool.name} 
                                    onClick={() => handleToolClick(tool)}
                                    className={`p-3 border transition-all cursor-pointer ${
                                        selectedTool?.name === tool.name
                                            ? 'bg-blue-500/20 border-blue-500/50 shadow-lg shadow-blue-500/20'
                                            : 'bg-gray-800 border-gray-700 hover:border-blue-500/30 hover:bg-gray-700'
                                    }`}
                                >
                                    <div className="font-mono text-sm font-bold text-blue-400">{tool.name}</div>
                                    <div className="text-xs text-gray-400 mt-1">{tool.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Terminal or Tool Detail */}
                <div className="flex-1 p-4 bg-black/20 flex flex-col">
                    {selectedTool ? (
                        <div className="flex flex-col h-full">
                            {/* Tool Detail Header */}
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-700">
                                <div>
                                    <h2 className="text-xl font-bold text-blue-400 font-mono">{selectedTool.name}</h2>
                                    <p className="text-sm text-gray-400 mt-1">{selectedTool.description}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedTool(null)}
                                    className="p-2 hover:bg-gray-700 rounded transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Tool Schema */}
                            <div className="mb-4">
                                <h3 className="text-xs uppercase text-gray-500 mb-2 font-bold">Parameters</h3>
                                <div className="bg-gray-800 p-3 rounded border border-gray-700">
                                    {selectedTool.schema?.properties ? (
                                        Object.entries(selectedTool.schema.properties).map(([key, prop]: [string, any]) => (
                                            <div key={key} className="mb-3 last:mb-0">
                                                <label className="text-xs text-gray-400 mb-1 block">
                                                    {key} <span className="text-gray-600">({prop.type})</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={toolArgs[key] || ''}
                                                    onChange={(e) => setToolArgs({ ...toolArgs, [key]: e.target.value })}
                                                    placeholder={`Enter ${key}...`}
                                                    className="w-full bg-black/50 text-white px-2 py-1.5 text-sm rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                                                />
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-xs text-gray-500">No parameters required</p>
                                    )}
                                </div>
                            </div>

                            {/* Execute Button */}
                            <button
                                onClick={handleExecuteTool}
                                className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded flex items-center justify-center gap-2 transition-colors mb-4"
                            >
                                <Play className="w-4 h-4" />
                                Execute Tool
                            </button>

                            {/* Tool Result */}
                            {toolResult && (
                                <div className="flex-1 overflow-auto">
                                    <h3 className="text-xs uppercase text-gray-500 mb-2 font-bold">Result</h3>
                                    <div className="bg-black p-3 rounded border border-gray-700 font-mono text-sm text-green-400 whitespace-pre-wrap">
                                        {toolResult}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Terminal />
                    )}
                </div>
            </div>
        </div>
    );
};
