import React, { useState, useEffect } from 'react';
import './App.css';
import './celular.css';
import Semana from './components/Semana';
import dayjs from 'dayjs';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';





function App() {
  const [duplas, setDuplas] = useState([]);
  const [puestos, setPuestos] = useState(["remolino", "canoa", "Playita", "Casilla", "Pocha", "botes"]);
  const [guardavidas1, setGuardavidas1] = useState("Ger");
  const [guardavidas2, setGuardavidas2] = useState("Vito");
  const [francos, setFrancos] = useState("miércoles");
  const [fijo, setFijo] = useState(false);
  const [puestoFijo, setPuestoFijo] = useState(false);
  const [fechaInicio, setFechaInicio] = useState("2025-12-01");
  const [fechaFin, setFechaFin] = useState("2026-03-31");
  const [nuevoPuesto, setNuevoPuesto] = useState("");
  const [rotanCada, setRotanCada] = useState(3);
  const [rangoFechas, setRangoFechas] = useState([]);
  const [historial, setHistorial] = useState({});
  const [semanas, setSemanas] = useState([]);
  const [feriados, setFeriados] = useState([]);
  const [menuLateralExtendido, setMenuLateralExtendido] = useState(() => { return window.innerWidth > 854 });

  //--------------------------------------------------------------------------------------------
  // si fecha inicio es 2025 y fecha fin es el año siguiente, traer feriados de 2026 tambien
  const añoInicio = dayjs(fechaInicio).year();
  const añoFin = dayjs(fechaFin).year();



  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setMenuLateralExtendido(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize)
  }, []);


  const traerFeriados = (año) => {
    fetch(`https://api.argentinadatos.com/v1/feriados/${año}`)
      .then(response => response.json())
      .then(data => {
        // Procesar los datos recibidos
        setFeriados(prevFeriados => [...prevFeriados, ...data]);
      })
      .catch(error => {
        console.error('Error al obtener los datos:', error);
      });
  }
  //--------------------------------------------------------------------------------------------

  const obtenerDiaSemana = (fecha) => {
    let iRet = {
      "id": dayjs(fecha).hour(12).locale('es').format('dddd') + " " + fecha,
      "name": dayjs(fecha).hour(12).locale('es').format('dddd'),
      "day": fecha
    };
    //return dayjs(fecha).hour(12).locale('es').format('dddd');

    return iRet;
  }


  const obtenerRangoFechas = (inicio, fin) => {
    const fechas = [];
    let actual = dayjs(inicio).hour(12);
    const ultimo = dayjs(fin).hour(12);

    while (!actual.isAfter(ultimo)) {
      fechas.push(actual.format('YYYY-MM-DD'));
      actual = actual.add(1, 'day');
    }

    return fechas;
  };

  const separarRangoPorSemanas = (inicio, fin) => {
    const fechas = obtenerRangoFechas(inicio, fin);

    const semanas = [];
    let semanaActual = [];

    for (const f of fechas) {
      semanaActual.push(obtenerDiaSemana(f));

      const dia = dayjs(f).hour(12).day();
      // day(): 0 domingo, 1 lunes, ..., 6 sábado

      if (dia === 0) {
        // si es domingo, cerramos la semana y empezamos otra
        semanas.push(semanaActual);
        semanaActual = [];
      }
    }

    // Si quedó algo sin cerrar (última semana)
    if (semanaActual.length > 0) {
      semanas.push(semanaActual);
    }

    return semanas;
  };

  // console.log(obtenerDiaSemana(fechaInicio));
  // console.log(obtenerRangoFechas(fechaInicio, fechaFin));
  // console.log(separarRangoPorSemanas(fechaInicio, fechaFin));

  useEffect(() => {
    setRangoFechas(separarRangoPorSemanas(fechaInicio, fechaFin));
    if (añoInicio !== añoFin) {
      traerFeriados(añoInicio);
      traerFeriados(añoFin);
    } else {
      traerFeriados(añoInicio);
    }
    console.log("Feriados cargados:", feriados);
  }, [fechaInicio, fechaFin]);
  //---------------------------------------------------------------------------------------------

  const agregarPuesto = () => {
    if (nuevoPuesto.trim() === "") {
      alert("Por favor ingrese un nombre de puesto.");
      return;
    }
    setPuestos([...puestos, nuevoPuesto]);
    setNuevoPuesto("");
    setHistorial({})
  }

  const cargarDupla = () => {
    if (guardavidas1 === "" || guardavidas2 === "" || francos === "") {
      alert("Por favor complete todos los campos antes de agregar una dupla.");
      return;
    }
    const nuevaDupla = {
      id: duplas.length + 1,
      guardavidas1: guardavidas1,
      guardavidas2: guardavidas2,
      francos: francos,
      fijo: fijo === "si",
      puestoFijo: puestoFijo,
      franquera: false
    }


    setDuplas([...duplas, nuevaDupla]);
    setGuardavidas1("");
    setGuardavidas2("");
    setFrancos("");
    setFijo("");
    setPuestoFijo("");
    setHistorial({})
  }

  const eliminarPuesto = (index) => () => {
    const nuevosPuestos = puestos.filter((_, i) => i !== index);
    setPuestos(nuevosPuestos);
  }

  const eliminarDupla = (id) => {
    console.log("Eliminando dupla con id:", id);
    const nuevasDuplas = duplas.filter((dupla) => dupla.id !== id);
    setDuplas(nuevasDuplas);
  }

  const duplaFranquera = (duplaId) => {
    duplas.map((dupla) => {
      if (dupla.id === duplaId) {
        dupla.franquera = true
      }
      return dupla
    })
    setDuplas([...duplas])
    console.log(duplas);
  }

  const duplaNoFranquera = (duplaId) => {
    duplas.map((dupla) => {
      if (dupla.id === duplaId) {
        dupla.franquera = false
      }
      return dupla
    })
    setDuplas([...duplas])
    console.log(duplas);
  }
  //-----------------------------------------------------------------------------------
  const coloresDuplas = {};

  const PALETA = [
    "#ff7c7cff", "#6dffa5ff", "#6797ffff",
    "#ffe057ff", "#c25fffff", "#69ffedff",
    "#ffb657ff", "#8f5fffff", "#ceffa7ff"
  ];

  const getColorDupla = (id) => {
    if (!coloresDuplas[id]) {
      const color = PALETA[Object.keys(coloresDuplas).length % PALETA.length];
      coloresDuplas[id] = color;
    }
    return coloresDuplas[id];
  };



  const cargarPuestoDeDuplaAlHistorial = (historial, duplaId, puesto, dia, asistio = true) => {
    historial[duplaId] ??= { secuencia: [], dias: {} };
    historial[duplaId].secuencia.push(puesto);
    if (dia) historial[duplaId].dias[dia.id] = { puesto, asistio };
    return historial;
  };



  const ContarSiTieneQueRotar = (historial, duplaId, puesto, rotanCada) => {
    const seq = historial[duplaId]?.secuencia;
    if (!seq || seq.length === 0) return false;
    let veces = 0;
    for (let i = seq.length - 1; i >= 0; i--) {
      if (seq[i] === puesto) {
        veces++;
        if (veces >= rotanCada) return true;
      } else break;
    }
    return false;
  }





  const generarFilas = (puestos, duplas, historial, semana) => {
    const filasPorPuestoDeLaSemana = {};
    puestos.forEach(p => filasPorPuestoDeLaSemana[p] = { puesto: p });

    for (const dia of semana) {
      const usedPuestos = new Set();
      const idsYaAsignados = new Set();

      // 1) DETECCION DE FERIADO o primer dia
      // Buscamos si la fecha actual (dia.day) coincide con algún feriado de la lista
      const esFeriado = feriados.some(f => f.fecha === dia.day) || dia.day === fechaInicio;


      // -----------------------------------------------------------------------
      // 1. DUPLAS FIJAS (Los dueños de casa)
      // -----------------------------------------------------------------------
      for (const d of duplas) {
        // CAMBIO: Si es feriado, TRABAJA aunque sea su día de franco.
        const leTocaTrabajar = esFeriado || d.francos !== dia.name;

        if (d.fijo && leTocaTrabajar) {
          const pf = d.puestoFijo;
          if (!usedPuestos.has(pf)) {
            filasPorPuestoDeLaSemana[pf][dia.id] = { texto: `${d.guardavidas1} / ${d.guardavidas2}`, id: d.id };
            usedPuestos.add(pf);
            idsYaAsignados.add(d.id);
            setHistorial(cargarPuestoDeDuplaAlHistorial(historial, d.id, pf, dia));
          }
        }
      }

      // -----------------------------------------------------------------------
      // PREPARAR GRUPOS (Incluyendo la lógica de Feriado)
      // -----------------------------------------------------------------------

      // Franqueras que trabajan hoy (porque no tienen franco O es feriado)
      const franquerasDisponibles = duplas.filter(d =>
        d.franquera && (esFeriado || d.francos !== dia.name)
      );

      // Rotativas que trabajan hoy (porque no tienen franco O es feriado)
      const rotativasPresentes = duplas.filter(d =>
        !d.fijo && !d.franquera && (esFeriado || d.francos !== dia.name)
      );

      // -----------------------------------------------------------------------
      // 2. DUPLAS ROTATIVAS (Ocupan sus lugares lógicos)
      // -----------------------------------------------------------------------
      for (const d of rotativasPresentes) {
        if (idsYaAsignados.has(d.id)) continue;

        const seq = historial[d.id]?.secuencia;
        const last = seq?.[seq.length - 1] ?? null;
        const debeRotar = last ? ContarSiTieneQueRotar(historial, d.id, last, rotanCada) : false

        // A) Intentar quedarse en el mismo
        if (last && !debeRotar && !usedPuestos.has(last)) {
          filasPorPuestoDeLaSemana[last][dia.id] = { texto: `${d.guardavidas1} / ${d.guardavidas2}`, id: d.id };
          usedPuestos.add(last);
          idsYaAsignados.add(d.id);
          setHistorial(cargarPuestoDeDuplaAlHistorial(historial, d.id, last, dia));
          continue;
        }

        // B) Calcular siguiente puesto lógico
        let startIdx = 0;
        if (last) {
          const lastIdx = puestos.indexOf(last);
          startIdx = debeRotar ? (lastIdx + 1) % puestos.length : lastIdx;
        }

        // C) Buscar lugar
        for (let i = 0; i < puestos.length; i++) {
          const idx = (startIdx + i) % puestos.length;
          const puesto = puestos[idx];

          if (usedPuestos.has(puesto)) continue;

          filasPorPuestoDeLaSemana[puesto][dia.id] = { texto: `${d.guardavidas1} / ${d.guardavidas2}`, id: d.id };
          usedPuestos.add(puesto);
          idsYaAsignados.add(d.id);
          setHistorial(cargarPuestoDeDuplaAlHistorial(historial, d.id, puesto, dia));
          break;
        }
      }

      // -----------------------------------------------------------------------
      // 3. FASE DE RELLENO PRIORITARIO (Franqueras)
      // -----------------------------------------------------------------------
      let indexFranquera = 0;

      for (let i = 0; i < puestos.length; i++) {
        const puesto = puestos[i];

        if (!usedPuestos.has(puesto) && indexFranquera < franquerasDisponibles.length) {
          const f = franquerasDisponibles[indexFranquera];

          // Agregamos un indicador visual si es feriado, opcional
          const textoFeriado = esFeriado ? " (Feriado)" : " (F)";

          filasPorPuestoDeLaSemana[puesto][dia.id] = {
            texto: `${f.guardavidas1} / ${f.guardavidas2}${textoFeriado}`,
            id: f.id
          };

          usedPuestos.add(puesto);
          idsYaAsignados.add(f.id);
          setHistorial(cargarPuestoDeDuplaAlHistorial(historial, f.id, puesto, dia));
          indexFranquera++;
        }
      }

      // -----------------------------------------------------------------------
      // 4. REGISTRO DE AUSENTES
      // -----------------------------------------------------------------------
      for (const d of duplas) {
        // CAMBIO CRITICO: Solo registramos ausencia si NO ES FERIADO.
        // Si es feriado, nadie falta (todos entraron en las fases anteriores).
        if (!esFeriado && d.francos === dia.name) {

          if (d.fijo) {
            setHistorial(cargarPuestoDeDuplaAlHistorial(historial, d.id, d.puestoFijo, dia, false));
          } else {
            const seq = historial[d.id]?.secuencia;
            const last = seq?.[seq.length - 1] ?? null;
            if (last) {
              const debeRotar = ContarSiTieneQueRotar(historial, d.id, last, rotanCada);
              let puestoAsignado = last;
              if (debeRotar) {
                const lastIdx = puestos.indexOf(last);
                puestoAsignado = puestos[(lastIdx + 1) % puestos.length];
              }
              setHistorial(cargarPuestoDeDuplaAlHistorial(historial, d.id, puestoAsignado, dia, false));
            }
          }
        }
      }
    }

    return { filas: Object.values(filasPorPuestoDeLaSemana) };
  };


  useEffect(() => {
    const nuevasSemanas = rangoFechas.map((semana) => {
      const { filas } = generarFilas(puestos, duplas, historial, semana);
      const isMobile = window.innerWidth < 854;

      const colDefs = [
        {
          field: "puesto",
          headerName: "Puestos",
          width: isMobile ? 75 : 120,
          minWidth: 60,
          maxWidth: 120,
          pinned: 'left'
        },
        ...semana.map(dia => {

          // 1. Detectamos si es Feriado
          const esFeriado = feriados.some(f => f.fecha === dia.day);
          const esPrimerDia = dia.day === fechaInicio

          // 2. Detectamos si es Finde (opcional, si queres pintarlos tambien)
          const nombreDia = dia.name.toLowerCase();
          const esFinDeSemana = nombreDia.includes('sábado') || nombreDia.includes('domingo');

          return {
            field: dia.id,
            headerName: esFeriado
              ? `${dia.name} ${dia.day} (F)`   // 1. ¿Es feriado? Pon (F)
              : esPrimerDia
                ? `${dia.name} ${dia.day} (P)` // 2. Si NO es feriado, ¿Es primer día? Pon (P)
                : `${dia.name} ${dia.day}`,    // 3. Si no es nada, pon el texto normal
            flex: isMobile ? 0 : 1,

            // En Celular las hacemos más finas (75px) para ver más días. En PC base de 145px.
            width: isMobile ? 75 : 145,

            minWidth: 75, // Para que nunca sea ilegible




            // 1) cellStyle: Pinta el FONDO de la celda (Jueves Feriado = Rojo Suave)
            cellStyle: (params) => {
              if (esFeriado) return { backgroundColor: '#ffcccc', display: 'flex', alignItems: 'center', justifyContent: 'center' };
              if (esPrimerDia) return { backgroundColor: '#B5FFB5', display: 'flex', alignItems: 'center', justifyContent: 'center' };
              if (esFinDeSemana) return { backgroundColor: '#818181ff', display: 'flex', alignItems: 'center', justifyContent: 'center' };
              return { display: 'flex', alignItems: 'center', justifyContent: 'center' };
            },

            // 2) cellRenderer: Dibuja la DUPLA como un BOTÓN flotando encima del fondo
            cellRenderer: (p) => {
              if (p.value) {
                // Si hay gente, dibujamos un DIV con el color de la dupla
                return (
                  <div style={{
                    backgroundColor: getColorDupla(p.value.id), // Color de la dupla
                    width: "95%",  // Un poquito menos del 100% para que se vea el rojo del feriado alrededor
                    height: "80%",
                    borderRadius: "6px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "#000"
                  }}>
                    {p.value.texto}
                  </div>
                );
              }
              return ""; // Si esta vacio, no dibujamos nada (se ve el fondo rojo/gris)
            }
          };
        })
      ];

      return {
        colDefs,
        rowData: filas
      };
    });

    setSemanas(nuevasSemanas);
  }, [rangoFechas, puestos, duplas, historial, rotanCada, feriados]);
  // console.log("Semanas generadas:", semanas);
  // console.log("historial:", historial);

  //--------------------------------------------------------------------


  const exportarExcelColorido = async () => {
    // 1. Creamos el libro de trabajo
    const workbook = new ExcelJS.Workbook();

    // 2. Recorremos cada semana para crear su hoja
    semanas.forEach((semanaData, index) => {
      // Crea una hoja por semana
      const worksheet = workbook.addWorksheet(`Semana ${index + 1}`);

      // --- A) DEFINIR COLUMNAS Y CABECERAS ---
      const columns = [
        { header: 'Puesto', key: 'puesto', width: 20 }, // Primera columna fija
      ];

      // Extraemos los IDs de los días para usarlos como keys
      const headerRow = semanaData.colDefs
        .filter(col => col.field !== 'puesto') // Quitamos la columna puesto
        .map(col => {
          columns.push({ header: col.headerName, key: col.field, width: 25 }); // Ancho de columna (más espacioso)
          return col;
        });

      // Asignamos las columnas a la hoja
      worksheet.columns = columns;

      // --- B) ESTILIZAR CABECERA (Feriados e Inicio) ---
      const headerRowRef = worksheet.getRow(1);
      headerRowRef.height = 30; // Más alto
      headerRowRef.font = { bold: true };
      headerRowRef.alignment = { vertical: 'middle', horizontal: 'center' };

      headerRowRef.eachCell((cell, colNumber) => {
        const headerText = cell.value.toString();

        // Pinta de rojo claro si es Feriado (F)
        if (headerText.includes('(F)')) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFCCCC' } // Rojo claro
          };
        }
        // Pinta de verde claro si es Inicio (P) - Opcional
        else if (headerText.includes('(P)')) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFCCFFCC' } // Verde claro
          };
        }
      });

      // --- C) AÑADIR FILAS DE DATOS ---
      semanas[index].rowData.forEach(filaOriginal => {
        const filaParaExcel = { puesto: filaOriginal.puesto };

        // Preparamos los datos extrayendo solo el texto
        Object.keys(filaOriginal).forEach(key => {
          if (key !== 'puesto' && key !== 'id' && filaOriginal[key]) {
            filaParaExcel[key] = filaOriginal[key].texto;
          }
        });

        const addedRow = worksheet.addRow(filaParaExcel);
        addedRow.height = 40; // Altura de fila mucho más espaciosa

        // --- D) ESTILIZAR CELDAS DE DUPLAS ---
        addedRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
          const colKey = columns[colNumber - 1].key;

          // Si no es la columna de puesto y la celda tiene datos
          if (colKey !== 'puesto') {
            const duplaData = filaOriginal[colKey];
            if (duplaData) {
              let colorRaw = getColorDupla(duplaData.id);

              // 2. Limpiamos el string
              let hex = colorRaw.replace('#', '');

              // 3. CORRECCIÓN: Si el color tiene 8 letras (RRGGBBAA), nos quedamos solo con las primeras 6 (RRGGBB)
              if (hex.length === 8) {
                hex = hex.substring(0, 6);
              }

              // 4. Ahora sí le agregamos el FF al principio para hacerlo AARRGGBB
              const argbColor = `FF${hex}`;

              // 2. Aplicar estilo de "tarjeta"
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: argbColor } // Usamos el color corregido
              };
              cell.font = { bold: true };
              cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
              cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
              };
            }
          } else {
            // Alineación para la columna de Puestos
            cell.alignment = { vertical: 'middle', horizontal: 'left' };
          }
        });
      });
    });

    // 3. Generar y descargar el archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'ROTACION.xlsx');
  };



  return (
    <div className="layout-split">

      {/* BARRA LATERAL */}
      <div className={menuLateralExtendido ? 'menu-lateral-extendido' : 'menu-lateral-comprimido'}>

        <div
          onClick={() => setMenuLateralExtendido(!menuLateralExtendido)}
          style={{ cursor: 'pointer' }}
          className='botonCompresor'
        >
          {menuLateralExtendido ? '<' : '>'}
        </div>


        {menuLateralExtendido && (
          <div
            onClick={() => {
              // Busca el elemento que contiene el scroll. 
              // Cambia '.contenido-principal' por la clase REAL de tu contenedor derecho
              const contenedor = document.querySelector('.contenido-scroll');

              if (contenedor) {
                contenedor.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                // Por si acaso fuera el window (fallback)
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            style={{ cursor: 'pointer' }} // Para que salga la manito
          >
            <h1>Generador de <br /> <span style={{ color: "#760000" }}> Rotaciones </span></h1>
          </div>
        )}

        {!menuLateralExtendido && (
          <div
            onClick={() => {
              // Busca el elemento que contiene el scroll. 
              // Cambia '.contenido-principal' por la clase REAL de tu contenedor derecho
              const contenedor = document.querySelector('.contenido-scroll');

              if (contenedor) {
                contenedor.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                // Por si acaso fuera el window (fallback)
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            style={{ cursor: 'pointer' }} // Para que salga la manito
            className='titulo'
          >
            <div> G<span style={{ color: "#760000" }}>R</span></div>
          </div>
        )}


        {/* OPCIONES */}
        {menuLateralExtendido && (
          <div className='listaOpciones'>
            <div className='opcion-menu'
              onClick={() => {
                const seccion = document.getElementById('fechasTemporada');
                if (seccion) {
                  seccion.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar-plus" viewBox="0 0 16 16">
                <path d="M8 7a.5.5 0 0 1 .5.5V9H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V10H6a.5.5 0 0 1 0-1h1.5V7.5A.5.5 0 0 1 8 7" />
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
              </svg> <br />
              Agregar Fechas
            </div>


            <div className='opcion-menu'
              onClick={() => {
                const seccion = document.getElementById('agregarDuplas');
                if (seccion) {
                  seccion.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-people-fill" viewBox="0 0 16 16">
                <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
              </svg> <br />
              Agregar Duplas
            </div>


            <div className='opcion-menu'
              onClick={() => {
                const seccion = document.getElementById('agregarPuestos');
                if (seccion) {
                  seccion.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-diagram-2-fill" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M6 3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5v1A1.5 1.5 0 0 1 8.5 6v1H11a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 5 7h2.5V6A1.5 1.5 0 0 1 6 4.5zm-3 8A1.5 1.5 0 0 1 4.5 10h1A1.5 1.5 0 0 1 7 11.5v1A1.5 1.5 0 0 1 5.5 14h-1A1.5 1.5 0 0 1 3 12.5zm6 0a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1A1.5 1.5 0 0 1 9 12.5z" />
              </svg> <br />
              Agregar Puestos
            </div>

            <div className='opcion-menu'
              onClick={() => {
                const seccion = document.getElementById('VistaPrevia');
                if (seccion) {
                  seccion.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-easel3-fill" viewBox="0 0 16 16">
                <path d="M8.5 12v1.134a1 1 0 1 1-1 0V12h-5A1.5 1.5 0 0 1 1 10.5V3h14v7.5a1.5 1.5 0 0 1-1.5 1.5zm7-10a.5.5 0 0 0 0-1H.5a.5.5 0 0 0 0 1z" />
              </svg> <br />
              Vista Previa
            </div>
          </div>
        )}

        {menuLateralExtendido && (
          <footer className='footer-menu-extendido'>
            <hr style={{ width: '100%', color: "white" }}></hr>
            <h3> German Ariel Metzger </h3> <strong style={{ color: "#551111" }}>Desarrolador</strong>
            <hr style={{ width: '100%', color: "white" }}></hr>
            <h3> Roma Pazo </h3> <strong style={{ color: "#551111" }}>Diseñadora</strong>
            <hr style={{ width: '100%', color: "white" }}></hr>
          </footer>
        )}

        {!menuLateralExtendido && (
          <div className='listaOpciones-reducido'>
            <div className='opcion-menu-reducido'
              onClick={() => {
                const seccion = document.getElementById('fechasTemporada');
                if (seccion) {
                  seccion.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-calendar-plus" viewBox="0 0 16 16">
                <path d="M8 7a.5.5 0 0 1 .5.5V9H10a.5.5 0 0 1 0 1H8.5v1.5a.5.5 0 0 1-1 0V10H6a.5.5 0 0 1 0-1h1.5V7.5A.5.5 0 0 1 8 7" />
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
              </svg>
            </div>


            <div className='opcion-menu-reducido'
              onClick={() => {
                const seccion = document.getElementById('agregarDuplas');
                if (seccion) {
                  seccion.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-people-fill" viewBox="0 0 16 16">
                <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5.784 6A2.24 2.24 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.3 6.3 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
              </svg>
            </div>


            <div className='opcion-menu-reducido'
              onClick={() => {
                const seccion = document.getElementById('agregarPuestos');
                if (seccion) {
                  seccion.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-diagram-2-fill" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M6 3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5v1A1.5 1.5 0 0 1 8.5 6v1H11a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-1 0V8h-5v.5a.5.5 0 0 1-1 0v-1A.5.5 0 0 1 5 7h2.5V6A1.5 1.5 0 0 1 6 4.5zm-3 8A1.5 1.5 0 0 1 4.5 10h1A1.5 1.5 0 0 1 7 11.5v1A1.5 1.5 0 0 1 5.5 14h-1A1.5 1.5 0 0 1 3 12.5zm6 0a1.5 1.5 0 0 1 1.5-1.5h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1A1.5 1.5 0 0 1 9 12.5z" />
              </svg>
            </div>

            <div className='opcion-menu-reducido'
              onClick={() => {
                const seccion = document.getElementById('VistaPrevia');
                if (seccion) {
                  seccion.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-easel3-fill" viewBox="0 0 16 16">
                <path d="M8.5 12v1.134a1 1 0 1 1-1 0V12h-5A1.5 1.5 0 0 1 1 10.5V3h14v7.5a1.5 1.5 0 0 1-1.5 1.5zm7-10a.5.5 0 0 0 0-1H.5a.5.5 0 0 0 0 1z" />
              </svg>
            </div>

          </div>
        )}




      </div>







      <div className='contenido-scroll'>

        <div className='home'  >
          <h1>GENERADOR DE <br /> ROTACIONES</h1>

        </div>

        <div className='inserts'>




          {/* inicio y fin de temporada */}
          <div id="fechasTemporada" className='formulario'>
            <h2>FECHAS TEMPORADA</h2>
            <h5>INGRESE EL INICIO DE TEMPORADA</h5>
            <input type="date" min={new Date().toISOString().split('T')[0]} onChange={(e) => { setFechaInicio(e.target.value) }} required />
            <h5>INGRESE EL FIN DE TEMPORADA</h5>
            <input type="date" min={fechaInicio} onChange={(e) => { setFechaFin(e.target.value) }} required />
          </div>








          {/* info de las duplas */}
          <div id="agregarDuplas" className='formulario'>
            <h2 >DUPLAS</h2>
            <h5>INGRESE LOS NOMBRES DE LAS DUPLAS SEPARADAS POR UN ESPACIO</h5>
            <input type="text" placeholder="Vito Merciai" value={guardavidas1} onChange={(e) => { setGuardavidas1(e.target.value) }} required />
            <input type="text" placeholder="German Metzger" value={guardavidas2} onChange={(e) => { setGuardavidas2(e.target.value) }} required />


            <h5>INGRESAR DIA DE LA SEMANA QUE TIENEN FRANCO</h5>
            <select value={francos} onChange={(e) => { setFrancos(e.target.value) }}>
              <option value="">-</option>
              <option value="lunes">Lunes</option>
              <option value="martes">Martes</option>
              <option value="miércoles">Miércoles</option>
              <option value="jueves">Jueves</option>
              <option value="viernes">Viernes</option>
              <option value="sábado">Sábado</option>
              <option value="domingo">Domingo</option>
            </select>


            <h5>CONFIRMAR SI HACEN PUESTO FIJO</h5>
            <select value={fijo} onChange={(e) => { setFijo(e.target.value) }}>
              <option value="">-</option>
              <option value="si">Si</option>
              <option value="no">No</option>
            </select>
            {fijo === "si" &&
              <>
                <h5>SELECCIONAR PUESTO FIJO</h5>
                <select value={puestoFijo} onChange={(e) => { setPuestoFijo(e.target.value) }}>
                  <option value="">-</option>
                  {puestos.map((puesto, index) => (
                    <option key={index} value={puesto}>{puesto}</option>
                  ))}
                </select>
              </>
            }
            <button onClick={cargarDupla}>Agregar dupla</button>
          </div>

          <div className='lista'>
            <h2>LISTA DE DUPLAS</h2>
            {duplas.map((dupla) => (
              <div key={dupla.id} className="item-gv">
                <strong>{dupla.id}</strong>
                <p><strong>{dupla.guardavidas1}</strong> y <strong>{dupla.guardavidas2}</strong></p>
                <p><strong>Día franco:</strong> {dupla.francos}</p>
                {dupla.fijo && dupla.puestoFijo && <p><strong>Puesto fijo:</strong> {dupla.puestoFijo}</p>}
                {dupla.franquera && <p><strong>FRANQUERA</strong> </p>}
                <button className='btn-delete' onClick={() => eliminarDupla(dupla.id)}>X</button>
                {!dupla.franquera && !dupla.fijo && <button onClick={() => duplaFranquera(dupla.id)}>Hacer franquera</button>}
                {dupla.franquera && !dupla.fijo && <button onClick={() => duplaNoFranquera(dupla.id)}>Quitar franquera</button>}
              </div>
            ))}
          </div>




          <div id="agregarPuestos" className='formulario' >
            <h2 >PUESTOS</h2>
            <h5>INGRESE LOS PUESTOS EN ORDEN DE PRIORIDAD</h5>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h3>{puestos.length}</h3><input type="text" placeholder="Puesto" value={nuevoPuesto} onChange={(e) => { setNuevoPuesto(e.target.value); }} required /> <button onClick={agregarPuesto}>Agregar puesto</button>
            </div>
            <h5>INGRESAR CADA CUANTOS DIAS ROTAN</h5>
            <input type="number" min="1" placeholder="1" value={rotanCada} onChange={(e) => { setRotanCada(e.target.value); setHistorial({}); }} required style={{ width: '20%' }} />
          </div>


        </div>

        <div className='inserts'>

          {/* DUPLAS */}


          {/* PUESTOS */}
          <div className='lista'>
            <h2>LISTA DE PUESTOS</h2>
            {puestos.map((puesto, index) => (
              <div key={index} className="item">
                <h3>{index + 1}:</h3><p> {puesto}</p> <button className='btn-delete' onClick={eliminarPuesto(index)}>X</button>
              </div>
            ))}
          </div>
        </div>
        <div id='VistaPrevia' style={{ margin: '20px', textAlign: 'center' }}>
          <h1>Vista previa de la semana</h1>
          <div style={{ marginBottom: 20 }}>
            <button onClick={exportarExcelColorido} className="btn-exportar">
              Descargar Excel Completo 📥
            </button>
          </div>
        </div>
        <div className='listaSemanal'>
          {semanas.map((semana, index) => (
            <Semana
              key={index}
              colDefs={semana.colDefs}
              rowData={semana.rowData}
            />
          ))}
        </div>

      </div>
    </div>
  );
}

export default App;
