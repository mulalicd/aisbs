import React from 'react';

const TierBadge = ({ tier, remaining }) => {
    if (tier === 'custom_key') {
        return (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Production Tier</span>
                <span className="text-emerald-500/60 text-[9px] font-mono">UNLIMITED ACCESS</span>
            </div>
        );
    }

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
            <span className="text-blue-600 text-[10px] font-bold uppercase tracking-wider">Simulation Tier</span>
            {remaining !== undefined && (
                <span className="text-blue-500/70 text-[9px] font-mono">
                    {remaining}/5 QUOTA REMAINING
                </span>
            )}
        </div>
    );
};

export default TierBadge;
