import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

interface FieldInfo<M> {
    key: React.Key;
    label: string;
    getDisplayValue: (record: M) => string;
    align?: Parameters<typeof TableCell>[0]['align'];
}

interface ListViewProps<M> {
    records: M[];
    getRecordKey: (record: M) => React.Key;
    fieldsInfo: FieldInfo<M>[];
}

export const ListView = <M,>({ records, getRecordKey, fieldsInfo }: ListViewProps<M>) => {
    const headRowCells = fieldsInfo.map(({ key, label, align }) => (
        <TableCell key={key} align={align}>
            {label}
        </TableCell>
    ));

    const bodyRowsCells = records.map((record) => (
        <TableRow key={getRecordKey(record)}>
            {fieldsInfo.map(({ key, align, getDisplayValue }) => (
                <TableCell key={key} align={align}>
                    {getDisplayValue(record)}
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
