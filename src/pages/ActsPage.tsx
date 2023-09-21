import { useSelector } from 'react-redux';

import MuiOpenInNewIcon from '@mui/icons-material/OpenInNew';
import MuiLink from '@mui/material/Link';
import MuiIconButton from '@mui/material/IconButton';
import MUIPaper from '@mui/material/Paper';

import { ListView } from '../components/ListView';
import { type Act } from '../models/Act';
import { selectAllActs } from '../store/slices/acts';

export const ActsPage = () => {
    const allActs = useSelector(selectAllActs);

    return (
        <MUIPaper>
            <ListView<Act>
                name="Акти"
                records={allActs}
                fieldsInfo={[{ key: 'name', label: 'Назва', getDisplayValue: getActName }]}
                getRecordKey={getActRecordKey}
                actions={[{ key: 'link', getReactNode: getActionActWebViewLink }]}
            />
        </MUIPaper>
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
