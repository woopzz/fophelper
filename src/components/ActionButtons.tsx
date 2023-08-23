import { ReactNode } from 'react';

import MUIToolbar from '@mui/material/Toolbar';
import MUIButton from '@mui/material/Button';
import MuiTableRowsIcon from '@mui/icons-material/TableRows';

import useSidebarVisibility from '../hooks/useSidebarVisibility';

interface ActionButtonsProps {
    buttons?: ReactNode;
}

export const ActionButtons = ({ buttons = null }: ActionButtonsProps) => {
    const { permanent, setShowSidebar } = useSidebarVisibility();

    const handleClickMenu = () => setShowSidebar(true);

    return (
        <MUIToolbar
            sx={{
                gap: 1,
            }}
        >
            <MUIButton
                variant="contained"
                startIcon={<MuiTableRowsIcon />}
                onClick={handleClickMenu}
                sx={{ display: permanent ? 'none' : 'inherit' }}
            >
                Меню
            </MUIButton>
            {buttons}
        </MUIToolbar>
    );
};
