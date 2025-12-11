
import { useState } from 'react';
import { PageLayout } from '../components/PageLayout';
import { FolderTree, File as FileIcon, Folder, Plus, Trash2, ArrowUp, ChevronRight, HardDrive, X, ExternalLink } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

export function FileSystemPage() {
    const { selectedPC, refresh, network, selectPC } = useSimulation();
    const [currentPath, setCurrentPath] = useState('/');
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [newItemName, setNewItemName] = useState('');
    const [showNewDialog, setShowNewDialog] = useState<'file' | 'folder' | null>(null);
    const [viewingFile, setViewingFile] = useState<{ name: string, content: string } | null>(null);

    // Auto-select first PC if none selected
    if (!selectedPC && network) {
        const pcs = network.getAllPCs();
        if (pcs.length > 0) {
            selectPC(pcs[0].id);
        }
    }

    // Calculate items in current path
    const items = selectedPC ? selectedPC.fs.ls(currentPath).map(name => {
        const fullPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`;
        const node = selectedPC.fs.stat(fullPath);
        return {
            name,
            type: node?.type || 'file',
            path: fullPath
        };
    }).sort((a, b) => {
        // Folders first, then files
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'directory' ? -1 : 1;
    }) : [];

    const handleNavigate = (path: string) => {
        setCurrentPath(path);
        setSelectedItem(null);
    };

    const handleUp = () => {
        if (currentPath === '/') return;
        const parts = currentPath.split('/').filter(Boolean);
        parts.pop();
        setCurrentPath(parts.length === 0 ? '/' : `/${parts.join('/')}`);
        setSelectedItem(null);
    };

    const handleDelete = () => {
        if (!selectedPC || !selectedItem) return;

        const fullPath = currentPath === '/' ? `/${selectedItem}` : `${currentPath}/${selectedItem}`;
        const item = items.find(i => i.name === selectedItem);

        if (item?.type === 'directory') {
            if (confirm(`Are you sure you want to delete folder "${selectedItem}" and all its contents?`)) {
                if (selectedPC.fs.rmdir(fullPath, true)) {
                    refresh();
                    setSelectedItem(null);
                } else {
                    alert('Failed to delete directory');
                }
            }
        } else {
            if (confirm(`Are you sure you want to delete "${selectedItem}"?`)) {
                if (selectedPC.fs.deleteFile(fullPath)) {
                    refresh();
                    setSelectedItem(null);
                } else {
                    alert('Failed to delete file');
                }
            }
        }
    };

    const handleOpen = () => {
        if (!selectedPC || !selectedItem) return;

        const fullPath = currentPath === '/' ? `/${selectedItem}` : `${currentPath}/${selectedItem}`;
        const item = items.find(i => i.name === selectedItem);

        if (item?.type === 'file') {
            const content = selectedPC.fs.readFile(fullPath);
            if (content !== null) {
                setViewingFile({ name: selectedItem, content });
            }
        } else if (item?.type === 'directory') {
            handleNavigate(item.path);
        }
    };

    const handleCreate = () => {
        if (!selectedPC || !newItemName || !showNewDialog) return;

        const fullPath = currentPath === '/' ? `/${newItemName}` : `${currentPath}/${newItemName}`;

        if (showNewDialog === 'folder') {
            if (selectedPC.fs.mkdir(fullPath)) {
                refresh();
                setShowNewDialog(null);
                setNewItemName('');
            } else {
                alert('Failed to create directory');
            }
        } else {
            // Create empty file
            try {
                selectedPC.fs.writeFile(fullPath, '');
                refresh();
                setShowNewDialog(null);
                setNewItemName('');
            } catch (e) {
                alert('Failed to create file');
            }
        }
    };

    if (!selectedPC) {
        return (
            <PageLayout title="File System" description="Manage files and folders">
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <HardDrive className="w-16 h-16 mb-4 opacity-50" />
                    <p>Select a PC from the Network Map to view its file system</p>
                </div>
            </PageLayout>
        );
    }

    return (
        <PageLayout
            title={`File System: ${selectedPC.hostname}`}
            description={`Manage files on ${selectedPC.ip}`}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* File Browser */}
                <div className="lg:col-span-2 border border-gray-800 rounded-lg bg-gray-900 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <button
                                onClick={handleUp}
                                disabled={currentPath === '/'}
                                className="p-1 hover:bg-gray-800 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                                <ArrowUp className="w-5 h-5 text-gray-400" />
                            </button>
                            <div className="flex items-center text-sm font-mono text-gray-300">
                                <span className="text-blue-400">root</span>
                                {currentPath.split('/').filter(Boolean).map((part, i) => (
                                    <div key={i} className="flex items-center">
                                        <ChevronRight className="w-4 h-4 text-gray-600 mx-1" />
                                        <span>{part}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowNewDialog('file')}
                                className="px-3 py-1.5 bg-gray-800 text-gray-300 rounded hover:bg-gray-700 transition-colors text-sm flex items-center gap-2"
                            >
                                <FileIcon className="w-4 h-4" />
                                New File
                            </button>
                            <button
                                onClick={() => setShowNewDialog('folder')}
                                className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded hover:bg-blue-500/30 transition-colors text-sm flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                New Folder
                            </button>
                        </div>
                    </div>

                    {showNewDialog && (
                        <div className="mb-4 p-4 bg-gray-800 rounded border border-gray-700">
                            <h3 className="text-sm font-medium text-white mb-2">
                                Create New {showNewDialog === 'file' ? 'File' : 'Folder'}
                            </h3>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newItemName}
                                    onChange={e => setNewItemName(e.target.value)}
                                    placeholder={`Enter ${showNewDialog} name...`}
                                    className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500"
                                    autoFocus
                                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                                />
                                <button
                                    onClick={handleCreate}
                                    className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                                >
                                    Create
                                </button>
                                <button
                                    onClick={() => { setShowNewDialog(null); setNewItemName(''); }}
                                    className="px-3 py-1.5 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        {items.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 text-sm">
                                This directory is empty
                            </div>
                        ) : (
                            items.map(item => (
                                <div
                                    key={item.name}
                                    onClick={() => setSelectedItem(item.name)}
                                    onDoubleClick={() => {
                                        if (item.type === 'directory') {
                                            handleNavigate(item.path);
                                        } else {
                                            const content = selectedPC.fs.readFile(item.path);
                                            if (content !== null) {
                                                setViewingFile({ name: item.name, content });
                                            }
                                        }
                                    }}
                                    className={`
                                        flex items-center gap-2 p-2 rounded cursor-pointer transition-colors select-none
                                        ${selectedItem === item.name ? 'bg-blue-500/20 border border-blue-500/30' : 'hover:bg-gray-800 border border-transparent'}
                                    `}
                                >
                                    {item.type === 'directory' ? (
                                        <Folder className="w-5 h-5 text-yellow-400" />
                                    ) : (
                                        <FileIcon className="w-5 h-5 text-gray-400" />
                                    )}
                                    <span className="text-gray-300 flex-1">{item.name}</span>
                                    {item.type === 'directory' && (
                                        <ChevronRight className="w-4 h-4 text-gray-600" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Operations Panel / Details */}
                <div className="border border-gray-800 rounded-lg bg-gray-900 p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Item Details</h2>
                    {selectedItem ? (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-gray-800 rounded-lg">
                                    <FileIcon className="w-8 h-8 text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-white break-all">{selectedItem}</h3>
                                    <p className="text-sm text-gray-500">File</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <button
                                    onClick={handleOpen}
                                    className="w-full px-4 py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Open
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="w-full px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <FolderTree className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>Select a file to view details and options</p>
                        </div>
                    )}
                </div>
            </div>


            {/* File Viewer Modal */}
            {
                viewingFile && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl">
                            <div className="flex items-center justify-between p-4 border-b border-gray-800">
                                <div className="flex items-center gap-2">
                                    <FileIcon className="w-5 h-5 text-blue-400" />
                                    <h3 className="font-medium text-white">{viewingFile.name}</h3>
                                </div>
                                <button
                                    onClick={() => setViewingFile(null)}
                                    className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-auto p-4 bg-gray-950">
                                <pre className="font-mono text-sm text-gray-300 whitespace-pre-wrap">{viewingFile.content}</pre>
                            </div>
                        </div>
                    </div>
                )
            }
        </PageLayout >
    );
}
