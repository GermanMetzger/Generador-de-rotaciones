import React from 'react'
import { useState, useEffect } from 'react';
import "./Semana.css"
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

import 'dayjs/locale/es';

ModuleRegistry.registerModules([AllCommunityModule]);



export default function Semana({rowData, colDefs}) {








  return (
    <div className="ag-theme-quartz" style={{ height: 325, width: "70vw",margin: "25px" }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        animateRows={true}
        theme="legacy"
        defaultColDef={{ minWidth: 20, resizable: true }} />
    </div>
  );
}

