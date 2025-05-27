'use client';

import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-balham.css';
import {
  GridReadyEvent,
  GridApi,
  Column,
  ColDef,
} from 'ag-grid-community';
import { fetchData, Athlete } from '../data/api';

const columnDefs: ColDef[] = [
    { headerName: "ID",      field: "id",      width: 70 },
    { headerName: "Athlete", field: "athlete", width: 150, editable: true },
    { headerName: "Age",     field: "age",     width: 90,  minWidth: 50, maxWidth: 100, editable: true },
    { headerName: "Country", field: "country", width: 120 },
    { headerName: "Year",    field: "year",    width: 90 },
    { headerName: "Date",    field: "date",    width: 110 },
    { headerName: "Sport",   field: "sport",   width: 110 },
    { headerName: "Gold",    field: "gold",    width: 100 },
    { headerName: "Silver",  field: "silver",  width: 100 },
    { headerName: "Bronze",  field: "bronze",  width: 100 },
    { headerName: "Total",   field: "total",   width: 100 },
  ];

type AgGridApi = {
  grid?: GridApi;
  column?: Column;
};

export default function Grid() {
  const [rowData, setRowData] = React.useState<Athlete[]>([]);
  const apiRef = React.useRef<AgGridApi>({});

  React.useEffect(() => {
    fetchData().then(setRowData);
  }, []);

  const onGridReady = (params: GridReadyEvent) => {
    // runtime’da params.columnApi var, TS’e “buna güven” demek için `as any`
    apiRef.current.grid   = params.api;
    apiRef.current.column = (params as any).columnApi as Column;
  };

  return (
    <div className="ag-theme-balham" style={{ height: '100vh', width: '100%', margin: 'auto' }}>
      <AgGridReact
        rowSelection="multiple"
        suppressRowClickSelection
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        rowData={rowData}
        defaultColDef={{ resizable: true, sortable: true, filter: true }}
      />
    </div>
  );
}
