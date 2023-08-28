import React from 'react';

import MUITable from '@mui/material/Table';
import MUITableContainer from '@mui/material/TableContainer';
import MUITableBody from '@mui/material/TableBody';
import MUITableHead from '@mui/material/TableHead';
import MUITableRow from '@mui/material/TableRow';
import MUITableCell from '@mui/material/TableCell';

interface FieldInfo<M> {
    key: React.Key;
    label: string;
    getDisplayValue: (record: M) => string;
    align?: Parameters<typeof MUITableCell>[0]['align'];
}

interface Action<M> {
    key: React.Key;
    getReactNode: (record: M) => React.ReactNode;
}

interface ListViewProps<M> {
    records: M[];
    getRecordKey: (record: M) => React.Key;
    fieldsInfo: FieldInfo<M>[];
    actions?: Action<M>[];
}

export const ListView = <M,>({ records, getRecordKey, fieldsInfo, actions = [] }: ListViewProps<M>) => {
    const headRowCells = fieldsInfo.map(({ key, label, align }) => (
        <MUITableCell key={key} align={align}>
            {label}
        </MUITableCell>
    ));

    headRowCells.push(...actions.map(({ key }) => <MUITableCell key={key} />));

    const bodyRowsCells = records.map((record) => (
        <MUITableRow key={getRecordKey(record)}>
            {fieldsInfo.map(({ key, align, getDisplayValue }) => (
                <MUITableCell key={key} align={align}>
                    {getDisplayValue(record)}
                </MUITableCell>
            ))}
            {actions.map((action) => (
                <MUITableCell key={action.key} align="right">
                    {action.getReactNode(record)}
                </MUITableCell>
            ))}
        </MUITableRow>
    ));

    return (
        <MUITableContainer>
            <MUITable>
                <MUITableHead>
                    <MUITableRow>{headRowCells}</MUITableRow>
                </MUITableHead>
                <MUITableBody>{bodyRowsCells}</MUITableBody>
            </MUITable>
        </MUITableContainer>
    );
};
