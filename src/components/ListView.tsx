import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

interface FieldInfo<M> {
    key: React.Key;
    label: string;
    getDisplayValue: (record: M) => string;
    align?: Parameters<typeof TableCell>[0]['align'];
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
        <TableCell key={key} align={align}>
            {label}
        </TableCell>
    ));

    headRowCells.push(...actions.map(({ key }) => <TableCell key={key} />));

    const bodyRowsCells = records.map((record) => (
        <TableRow key={getRecordKey(record)}>
            {fieldsInfo.map(({ key, align, getDisplayValue }) => (
                <TableCell key={key} align={align}>
                    {getDisplayValue(record)}
                </TableCell>
            ))}
            {actions.map((action) => (
                <TableCell key={action.key} align="right">
                    {action.getReactNode(record)}
                </TableCell>
            ))}
        </TableRow>
    ));

    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>{headRowCells}</TableRow>
                </TableHead>
                <TableBody>{bodyRowsCells}</TableBody>
            </Table>
        </TableContainer>
    );
};
