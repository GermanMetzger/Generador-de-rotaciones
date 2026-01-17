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
    <div className="grid-container ag-theme-quartz ">
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs}
        animateRows={true}
        headerHeight={70}
        theme="legacy"
        defaultColDef={{ minWidth: 20, resizable: true }} />
    </div>
  );
}

