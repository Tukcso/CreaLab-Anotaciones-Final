let workspaceData = { rodaje: [], arte: [], elenco: [] };
const idProyectoActivo = localStorage.getItem('proyectoActivo') || 'pato-1'; 
const viewContainer = document.getElementById('view-container');
const btnsMenu = document.querySelectorAll('.btn-spa');

// --- NUEVO: Función para guardar en la base de datos local ---
const guardarCambiosWorkspace = () => {
    // Traemos toda la base de datos de proyectos
    let db = JSON.parse(localStorage.getItem('crealab_db'));
    // Reemplazamos el proyecto actual con sus nuevos datos
    db = db.map(p => p.id === idProyectoActivo ? workspaceData : p);
    // Guardamos la base de datos actualizada
    localStorage.setItem('crealab_db', JSON.stringify(db));
};

// 1. Inicialización (Ahora lee del LocalStorage)
const initWorkspace = async () => {
    try {
        const dbLocal = localStorage.getItem('crealab_db');
        let todosLosProyectos = [];

        if (dbLocal) {
            // Si ya hay datos guardados, usamos esos
            todosLosProyectos = JSON.parse(dbLocal);
        } else {
            // Por si entra directo sin pasar por el dashboard
            const response = await fetch('../data/proyectos.json');
            todosLosProyectos = await response.json();
        }

        const proyectoActual = todosLosProyectos.find(p => p.id === idProyectoActivo);

        if(proyectoActual) {
            workspaceData = proyectoActual;
            document.getElementById('titulo-breadcrumb').innerText = proyectoActual.titulo;
            renderRodaje();
        } else {
            console.error("No se encontró el proyecto");
        }
    } catch (error) {
        console.error("Error cargando Workspace", error);
    }
};

// 2. Navegación SPA
btnsMenu.forEach(btn => {
    btn.addEventListener('click', (e) => {
        btnsMenu.forEach(b => {
            b.classList.remove('active', 'bg-warning', 'text-dark', 'fw-bold', 'shadow-sm');
            b.classList.add('text-white');
        });
        const target = e.currentTarget;
        target.classList.remove('text-white');
        target.classList.add('active', 'bg-warning', 'text-dark', 'fw-bold', 'shadow-sm');

        const view = target.dataset.view;
        if (view === 'rodaje') renderRodaje();
        if (view === 'arte') renderArte();
        if (view === 'elenco') renderElenco();
    });
});

// --- RENDERIZADO DE VISTAS ---
const renderRodaje = () => {
    viewContainer.innerHTML = `
        <div class="d-flex justify-content-between align-items-center border-bottom border-secondary pb-3 mb-4">
            <h2 class="h4 text-white m-0">Plan de Rodaje</h2>
            <button class="btn-pulse" onclick="crudRodaje('agregar')">+</button>
        </div>
        <div class="d-flex flex-column gap-3" id="lista-rodaje"></div>
    `;
    const lista = document.getElementById('lista-rodaje');
    
    workspaceData.rodaje.forEach(item => {
        const bgBadge = item.estado === 'FILMADA' ? 'bg-success' : item.estado === 'EN PROGRESO' ? 'bg-warning text-dark' : 'bg-danger';
        const neonColor = item.estado === 'FILMADA' ? 'success' : item.estado === 'EN PROGRESO' ? 'warning border-warning' : 'danger';
        
        lista.innerHTML += `
            <article class="card card-custom p-3 neon-${neonColor} card-hover">
                <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div class="d-flex align-items-center gap-3">
                        <span class="badge bg-dark border border-secondary p-2">${item.hora}</span>
                        <div>
                            <h3 class="h6 mb-0 text-white">${item.titulo}</h3>
                            <small class="txt-gray">${item.locacion}</small>
                        </div>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <span class="badge ${bgBadge}">${item.estado}</span>
                        <button class="btn btn-sm btn-outline-secondary" onclick="crudRodaje('editar', ${item.id})">✏️</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="eliminarItem('rodaje', ${item.id})">🗑️</button>
                    </div>
                </div>
                ${item.nota ? `<div class="mt-2 ps-5 border-start border-secondary ms-2"><p class="small text-white mb-0">🎥 ${item.nota}</p></div>` : ''}
            </article>
        `;
    });
};

const renderArte = () => {
    viewContainer.innerHTML = `
        <div class="d-flex justify-content-between align-items-center border-bottom border-secondary pb-3 mb-4">
            <h2 class="h4 text-white m-0">Desglose de Utilería</h2>
            <button class="btn-pulse" onclick="crudArte('agregar')">+</button>
        </div>
        <div class="row g-4" id="lista-arte"></div>
    `;
    const lista = document.getElementById('lista-arte');
    
    workspaceData.arte.forEach(item => {
        const bgBadge = item.estado === 'CONSEGUIDO' ? 'bg-success' : 'bg-danger';
        lista.innerHTML += `
            <article class="col-12 col-md-6">
                <div class="card card-custom h-100 p-4 neon-${item.estado === 'CONSEGUIDO' ? 'success' : 'danger'} card-hover">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <h3 class="h5 mb-1 text-white">${item.escena}</h3>
                        <span class="badge ${bgBadge} shadow-sm">${item.estado}</span>
                    </div>
                    <p class="text-warning small mb-3">🎭 ${item.descripcion}</p>
                    <div class="mt-auto d-flex gap-2">
                        <button class="btn btn-sm btn-outline-secondary w-50" onclick="crudArte('editar', ${item.id})">Modificar</button>
                        <button class="btn btn-sm btn-outline-danger w-50" onclick="eliminarItem('arte', ${item.id})">Quitar</button>
                    </div>
                </div>
            </article>
        `;
    });
};

const renderElenco = () => {
    viewContainer.innerHTML = `
        <div class="d-flex justify-content-between align-items-center border-bottom border-secondary pb-3 mb-4">
            <h2 class="h4 text-white m-0">Lista de Elenco</h2>
            <button class="btn-pulse" onclick="crudElenco('agregar')">+</button>
        </div>
        <div class="row g-4" id="lista-elenco"></div>
    `;
    const lista = document.getElementById('lista-elenco');
    
    workspaceData.elenco.forEach(actor => {
        const iniciales = actor.nombre.substring(0,2).toUpperCase();
        lista.innerHTML += `
            <article class="col-12 col-md-6 col-lg-4">
                <div class="card card-custom h-100 p-4 text-center card-hover">
                    <div class="rounded-circle bg-secondary d-flex justify-content-center align-items-center mx-auto mb-3" 
                         style="width: 80px; height: 80px; font-weight: bold; font-size: 1.5rem;">
                        ${iniciales}
                    </div>
                    <h3 class="h5 mb-1 text-white">${actor.nombre}</h3>
                    <p class="txt-brand small fw-bold mb-3">${actor.personaje}</p>
                    <span class="badge bg-dark border border-secondary w-100 py-2 mb-3">CITADO ${actor.citacion}</span>
                    <div class="d-flex gap-2">
                        <button class="btn btn-sm btn-outline-secondary w-50" onclick="crudElenco('editar', ${actor.id})">Editar</button>
                        <button class="btn btn-sm btn-outline-danger w-50" onclick="eliminarItem('elenco', ${actor.id})">Remover</button>
                    </div>
                </div>
            </article>
        `;
    });
};

// --- CRUD: ELIMINAR UNIVERSAL ---
const eliminarItem = async (seccion, id) => {
    const confirmacion = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        background: '#1E1E1E',
        color: '#979292',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#333333',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
        workspaceData[seccion] = workspaceData[seccion].filter(item => item.id !== id);
        
        guardarCambiosWorkspace(); // GUARDAMOS EL CAMBIO EN DB

        if (seccion === 'rodaje') renderRodaje();
        if (seccion === 'arte') renderArte();
        if (seccion === 'elenco') renderElenco();

        Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            background: '#1E1E1E',
            color: '#979292',
            confirmButtonColor: '#FF6B00',
            timer: 1500,
            showConfirmButton: false
        });
    }
};

// --- CRUD: RODAJE ---
const crudRodaje = async (accion, id = null) => {
    let item = id ? workspaceData.rodaje.find(i => i.id === id) : { hora: '', titulo: '', locacion: '', estado: 'PENDIENTE', nota: '' };
    
    const { value: formValues } = await Swal.fire({
        title: accion === 'agregar' ? 'Nueva Escena' : 'Modificar Escena',
        background: '#1E1E1E',
        color: '#979292',
        showCancelButton: true,
        confirmButtonColor: '#FF6B00',
        cancelButtonColor: '#333333',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Guardar',
        html: `
            <input id="sw-hora" type="time" class="swal2-input mb-2" value="${item.hora.replace(/ (AM|PM)/, '')}">
            <input id="sw-titulo" class="swal2-input mb-2" placeholder="Ej: Escena 1" value="${item.titulo}">
            <input id="sw-loc" class="swal2-input mb-2" placeholder="Locación" value="${item.locacion}">
            <select id="sw-est" class="swal2-select mb-2" style="width: 70%;">
                <option value="PENDIENTE" ${item.estado === 'PENDIENTE' ? 'selected' : ''}>PENDIENTE</option>
                <option value="EN PROGRESO" ${item.estado === 'EN PROGRESO' ? 'selected' : ''}>EN PROGRESO</option>
                <option value="FILMADA" ${item.estado === 'FILMADA' ? 'selected' : ''}>FILMADA</option>
            </select>
        `,
        preConfirm: () => {
            return {
                id: id || Date.now(),
                hora: document.getElementById('sw-hora').value + " HS",
                titulo: document.getElementById('sw-titulo').value || 'Sin Título',
                locacion: document.getElementById('sw-loc').value || 'Sin locación',
                estado: document.getElementById('sw-est').value,
                nota: item.nota
            }
        }
    });

    if (formValues) {
        if (accion === 'agregar') workspaceData.rodaje.push(formValues);
        else workspaceData.rodaje = workspaceData.rodaje.map(i => i.id === id ? formValues : i);
        
        guardarCambiosWorkspace(); // GUARDAMOS EL CAMBIO EN DB
        renderRodaje();
    }
};

// --- CRUD: ARTE ---
const crudArte = async (accion, id = null) => {
    let item = id ? workspaceData.arte.find(i => i.id === id) : { escena: '', descripcion: '', estado: 'FALTA' };
    
    const { value: formValues } = await Swal.fire({
        title: accion === 'agregar' ? 'Nueva Utilería' : 'Editar Utilería',
        background: '#1E1E1E',
        color: '#979292',
        showCancelButton: true,
        confirmButtonColor: '#FF6B00',
        cancelButtonColor: '#333333',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Guardar',
        html: `
            <input id="sw-escena" class="swal2-input mb-2" placeholder="Escena vinculada" value="${item.escena}">
            <input id="sw-desc" class="swal2-input mb-2" placeholder="Descripción del objeto" value="${item.descripcion}">
            <select id="sw-est2" class="swal2-select mb-2" style="width: 70%;">
                <option value="FALTA" ${item.estado === 'FALTA' ? 'selected' : ''}>FALTA</option>
                <option value="CONSEGUIDO" ${item.estado === 'CONSEGUIDO' ? 'selected' : ''}>CONSEGUIDO</option>
            </select>
        `,
        preConfirm: () => ({
            id: id || Date.now(),
            escena: document.getElementById('sw-escena').value || 'Sin asignar',
            descripcion: document.getElementById('sw-desc').value || 'Sin descripción',
            estado: document.getElementById('sw-est2').value
        })
    });

    if (formValues) {
        if (accion === 'agregar') workspaceData.arte.push(formValues);
        else workspaceData.arte = workspaceData.arte.map(i => i.id === id ? formValues : i);
        
        guardarCambiosWorkspace(); // GUARDAMOS EL CAMBIO EN DB
        renderArte();
    }
};

// --- CRUD: ELENCO ---
const crudElenco = async (accion, id = null) => {
    let item = id ? workspaceData.elenco.find(i => i.id === id) : { nombre: '', personaje: '', citacion: '' };
    
    const { value: formValues } = await Swal.fire({
        title: accion === 'agregar' ? 'Citar Actor' : 'Editar Citación',
        background: '#1E1E1E',
        color: '#979292',
        showCancelButton: true,
        confirmButtonColor: '#FF6B00',
        cancelButtonColor: '#333333',
        cancelButtonText: 'Cancelar',
        confirmButtonText: 'Guardar',
        html: `
            <input id="sw-nom" class="swal2-input mb-2" placeholder="Nombre Real" value="${item.nombre}">
            <input id="sw-per" class="swal2-input mb-2" placeholder="Personaje" value="${item.personaje}">
            <input id="sw-cit" type="time" class="swal2-input mb-2" value="${item.citacion}">
        `,
        preConfirm: () => ({
            id: id || Date.now(),
            nombre: document.getElementById('sw-nom').value || 'Sin nombre',
            personaje: document.getElementById('sw-per').value || 'Extra',
            citacion: document.getElementById('sw-cit').value || '00:00'
        })
    });

    if (formValues) {
        if (accion === 'agregar') workspaceData.elenco.push(formValues);
        else workspaceData.elenco = workspaceData.elenco.map(i => i.id === id ? formValues : i);
        
        guardarCambiosWorkspace(); // GUARDAMOS EL CAMBIO EN DB
        renderElenco();
    }
};

initWorkspace();