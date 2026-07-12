import { ReactNode } from 'react';

type ListPageShellProps = {
    title: string;
    actions?: ReactNode;
    filterBar?: ReactNode;
    children: ReactNode;
};

// Server-rendered frame for the admin list pages (Donations/Inventory/Users/…):
// page header + optional actions + optional FilterBar + list content.
export default function ListPageShell({ title, actions, filterBar, children }: ListPageShellProps) {
    return (
        <>
            <div className="page--header">
                <h3>{title}</h3>
                {actions}
            </div>
            {filterBar}
            {children}
        </>
    );
}
