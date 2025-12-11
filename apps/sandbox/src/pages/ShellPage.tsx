import { useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { PageLayout } from '../components/PageLayout';
import { RealShell } from '../components/RealShell';

export function ShellPage() {
    const { selectedPC, network, selectPC } = useSimulation();

    // Auto-select first PC if none selected (same as FileSystemPage)
    useEffect(() => {
        if (!selectedPC && network) {
            const pcs = network.getAllPCs();
            if (pcs.length > 0) {
                selectPC(pcs[0].id);
            }
        }
    }, [selectedPC, network, selectPC]);

    return (
        <PageLayout
            title="Shell"
            description="Real shell command execution with history"
        >
            <div className="h-[calc(100vh-10rem)] border border-dark-border bg-dark-bg overflow-hidden">
                <RealShell />
            </div>
        </PageLayout>
    );
}
