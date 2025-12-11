import React, { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { useSimulation } from '../context/SimulationContext';

interface CommandHistoryEntry {
    command: string;
    output: string;
    exitCode: number;
    timestamp: number;
}

export const RealShell: React.FC = () => {
    const { selectedPC, refresh } = useSimulation();
    const [history, setHistory] = useState<CommandHistoryEntry[]>([]);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [input, setInput] = useState('');
    const [isExecuting, setIsExecuting] = useState(false);

    // We don't track undo/redo locally anymore as we delegate to PC (unless we add valid undo support eventually)
    // Keeping UI state for history though.

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when history updates
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [history]);

    // Focus input on mount
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const executeCommand = async (cmd: string) => {
        if (!cmd.trim()) return;

        setIsExecuting(true);
        const timestamp = Date.now();

        // Add to command history for navigation
        setCommandHistory(prev => [...prev, cmd]);
        setHistoryIndex(-1);

        let output = '';
        let exitCode = 0;

        try {
            if (cmd === 'clear') {
                setHistory([]);
                setIsExecuting(false);
                return;
            }

            if (!selectedPC) {
                output = 'Error: No PC selected. Please select a PC from the Network Map.';
                exitCode = 1;
            } else {
                // Delegate to PC
                output = await selectedPC.executeCommand(cmd);
                // Refresh generic UI state (PC simulation state might have changed)
                refresh();
            }

            setHistory(prev => [...prev, {
                command: cmd,
                output,
                exitCode,
                timestamp
            }]);

        } catch (error: any) {
            setHistory(prev => [...prev, {
                command: cmd,
                output: error.message || 'Command execution failed',
                exitCode: 1,
                timestamp
            }]);
        }

        setIsExecuting(false);
    };

    // simplified handlers since we removed local undo stack for now
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        // History navigation
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (commandHistory.length === 0) return;

            const newIndex = historyIndex === -1
                ? commandHistory.length - 1
                : Math.max(0, historyIndex - 1);

            setHistoryIndex(newIndex);
            setInput(commandHistory[newIndex]);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex === -1) return;

            const newIndex = historyIndex + 1;
            if (newIndex >= commandHistory.length) {
                setHistoryIndex(-1);
                setInput('');
            } else {
                setHistoryIndex(newIndex);
                setInput(commandHistory[newIndex]);
            }
        }
        // Clear screen
        else if (e.ctrlKey && e.key === 'l') {
            e.preventDefault();
            setHistory([]);
        }
        // Cancel input
        else if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            setInput('');
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isExecuting) return;

        const cmd = input.trim();
        setInput('');
        executeCommand(cmd);
    };

    return (
        <div className="flex flex-col h-full bg-black text-green-400 font-mono text-sm">
            {/* Status Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-800 text-xs">
                <div className="flex items-center gap-4">
                    <span className="text-gray-400">Host:</span>
                    <span className="text-blue-400">{selectedPC ? selectedPC.hostname : 'No Connection'}</span>
                    <span className="text-gray-400">CWD:</span>
                    <span className="text-green-400">{selectedPC ? selectedPC.cwd : '-'}</span>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                    <span>History: {commandHistory.length}</span>
                </div>
            </div>

            {/* Terminal Output */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1" ref={scrollRef}>
                {history.slice(-50).map((entry, i) => (
                    <div key={i} className="space-y-1">
                        <div className="text-white">
                            <span className="text-green-600">user@{selectedPC?.hostname || 'sandbox'}</span>
                            <span className="text-gray-500">:</span>
                            <span className="text-blue-400">{selectedPC ? selectedPC.cwd : '~'}</span>
                            <span className="text-gray-500">$ </span>
                            <span>{entry.command}</span>
                        </div>
                        {entry.output && (
                            <div className={`whitespace-pre-wrap pl-2 ${entry.exitCode === 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {entry.output}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 border-t border-gray-800 bg-gray-900">
                <span className="text-green-600">user@{selectedPC?.hostname || 'sandbox'}</span>
                <span className="text-gray-500">:</span>
                <span className="text-blue-400">{selectedPC ? selectedPC.cwd : '~'}</span>
                <span className="text-gray-500">$</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isExecuting || !selectedPC}
                    className="flex-1 bg-transparent outline-none text-gray-100 placeholder-gray-700 disabled:opacity-50"
                    placeholder={selectedPC ? "Type a command... (↑/↓ for history, Ctrl+L to clear)" : "Select a PC to start terminal session"}
                    autoFocus
                />
                {isExecuting && (
                    <span className="text-yellow-400 animate-pulse">Executing...</span>
                )}
            </form>

            {/* Help Text */}
            <div className="px-4 py-2 bg-gray-950 border-t border-gray-800 text-xs text-gray-500">
                <span className="mr-4">↑/↓: History</span>
                <span className="mr-4">Ctrl+L: Clear</span>
                <span>Ctrl+C: Cancel</span>
            </div>
        </div>
    );
};
