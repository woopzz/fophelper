import { type ReactNode, createContext, useContext, useState } from 'react';

import { useTheme } from '@mui/material/styles';

import useWindowInnerWidth from './useWindowInnerWidth';
import { SIDEBAR_WIDTH } from '../data';

const SIDEBAR_DEFAULT_VISIBILITY = false;

const SidebarVisibilityContext = createContext({
    showSidebar: SIDEBAR_DEFAULT_VISIBILITY,
    // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
    setShowSidebar: (_: boolean) => {},
    permanent: true,
});

interface SidebarVisibilityProvider {
    children: ReactNode;
}

const SidebarVisibilityProvider = ({ children }: SidebarVisibilityProvider) => {
    const theme = useTheme();
    const screenWidth = useWindowInnerWidth();
    const [showSidebar, setShowSidebar] = useState(SIDEBAR_DEFAULT_VISIBILITY);

    const permanent = (screenWidth - theme.breakpoints.values.lg) / 2 > SIDEBAR_WIDTH;

    return (
        <SidebarVisibilityContext.Provider value={{ showSidebar: showSidebar || permanent, permanent, setShowSidebar }}>
            {children}
        </SidebarVisibilityContext.Provider>
    );
};

const useSidebarVisibility = () => useContext(SidebarVisibilityContext);

export { SidebarVisibilityProvider };
export default useSidebarVisibility;
