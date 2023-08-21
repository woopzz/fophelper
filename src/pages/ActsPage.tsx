import MuiOpenInNewIcon from '@mui/icons-material/OpenInNew';
import MuiLink from '@mui/material/Link';
import MuiIconButton from '@mui/material/IconButton';

import { ListView } from '../components/ListView';
import { Act } from '../models/Act';
import { useAppSelector } from '../hooks/store';

export const ActsPage = () => {
    const { allActs } = useAppSelector((state) => state.acts);

    return (
        <ListView<Act>
            records={allActs}
            fieldsInfo={[{ key: 'name', label: 'Назва', getDisplayValue: getActName }]}
            getRecordKey={getActRecordKey}
            actions={[{ key: 'link', getReactNode: getActionActWebViewLink }]}
        />
    );
};

function getActRecordKey(act: Act): React.Key {
    return act.gdId;
}

function getActName(act: Act): string {
    return act.name;
}

function getActionActWebViewLink(act: Act): React.ReactNode {
    return (
        <MuiLink href={act.gdWebViewLink} target="_blank" rel="noopener">
            <MuiIconButton>
                <MuiOpenInNewIcon />
            </MuiIconButton>
        </MuiLink>
    );
}
