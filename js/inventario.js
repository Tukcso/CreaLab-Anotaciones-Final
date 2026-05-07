// Captura de Nodos del DOM
const contenedorInventario = document.getElementById('grid-inventario');
const botonesFiltro = document.querySelectorAll('.btn-filtro');
const btnAgregar = document.getElementById('btn-agregar-equipo'); 

let equipos = []; 

// 1. Asincronismo y Fetch: Obtener los datos del JSON
const cargarEquipos = async () => {
    try {
        const response = await fetch('../data/inventario.json');
        if (!response.ok) throw new Error('Error al conectar');
        equipos = await response.json();
        renderizarEquipos(equipos);
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error de red',
            text: 'No se pudo cargar la base de datos del inventario.',
            background: '#1E1E1E',
            color: '#fff',
            confirmButtonColor: '#FF6B00'
        });
    }
};

// 2. Manipulación del DOM: Renderizar las tarjetas
const renderizarEquipos = (arrayEquipos) => {
    contenedorInventario.innerHTML = ''; 
    
    arrayEquipos.forEach(equipo => {
        const estadoClase = equipo.estado === 'DISPONIBLE' ? 'bg-success' : 
                           equipo.estado === 'EN REPARACIÓN' ? 'bg-warning text-dark' : 'bg-danger';
        const opacityClase = equipo.estado === 'EN REPARACIÓN' ? 'opacity-75' : '';

        const article = document.createElement('article');
        article.className = 'col-12 col-sm-6 col-lg-3';
        article.innerHTML = `
            <div class="card card-custom h-100 p-3 card-hover text-center ${opacityClase}">
                <div class="bg-secondary mb-3 rounded d-flex justify-content-center align-items-center mx-auto" style="height: 120px; width: 100%;">
                    <span class="fs-1">${equipo.icono}</span>
                </div>
                <h2 class="h6 text-white mb-1">${equipo.nombre}</h2>
                <p class="txt-brand small fw-bold mb-2">${equipo.categoria}</p>
                <span class="badge ${estadoClase} mx-auto mb-3">${equipo.estado}</span>
                
                <div class="mt-auto d-flex gap-2">
                    <button class="btn btn-sm btn-outline-secondary w-50 btn-editar" data-id="${equipo.id}">Modificar</button>
                    <button class="btn btn-sm btn-outline-danger w-50 btn-eliminar" data-id="${equipo.id}">Quitar</button>
                </div>
            </div>
        `;
        contenedorInventario.appendChild(article);
    });
};

// 5. Delegación de Eventos para Modificar y Quitar
contenedorInventario.addEventListener('click', (e) => {
    const idEquipo = parseInt(e.target.dataset.id);

    // Lógica quitado
    if (e.target.classList.contains('btn-eliminar')) {
        eliminarEquipo(idEquipo);
    }

    // Lógica modificacion
    if (e.target.classList.contains('btn-editar')) {
        editarEquipo(idEquipo);
    }
});


const eliminarEquipo = async (id) => {
    const equipo = equipos.find(eq => eq.id === id);
    
    const confirmacion = await Swal.fire({
        title: '¿Quitar equipo?',
        text: `Estás a punto de eliminar "${equipo.nombre}" del inventario.`,
        icon: 'warning',
        background: '#1E1E1E',
        color: '#979292',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#333333',
        confirmButtonText: 'Sí, quitar',
        cancelButtonText: 'Cancelar'
    });

    if (confirmacion.isConfirmed) {
        // Filtramos el array para excluir el ID seleccionado
        equipos = equipos.filter(eq => eq.id !== id);
        renderizarEquipos(equipos);

        Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'El equipo fue quitado del inventario.',
            background: '#1E1E1E',
            color: '#979292',
            confirmButtonColor: '#FF6B00'
        });
    }
};


const editarEquipo = async (id) => {

    const equipo = equipos.find(eq => eq.id === id);

    const { value: formValues } = await Swal.fire({
        title: 'Modificar Equipo',
        html:
            `<label class="text-white small mb-1 d-block text-start px-4">Nombre del Equipo</label>
             <input id="swal-edit-nombre" class="swal2-input mt-0 mb-3" value="${equipo.nombre}">
             
             <label class="text-white small mb-1 d-block text-start px-4">Estado Actual</label>
             <select id="swal-edit-estado" class="swal2-select mt-0" style="width: 70%;">
                <option value="DISPONIBLE" ${equipo.estado === 'DISPONIBLE' ? 'selected' : ''}>DISPONIBLE</option>
                <option value="EN USO" ${equipo.estado === 'EN USO' ? 'selected' : ''}>EN USO</option>
                <option value="EN REPARACIÓN" ${equipo.estado === 'EN REPARACIÓN' ? 'selected' : ''}>EN REPARACIÓN</option>
            </select>`,
        focusConfirm: false,
        background: '#1E1E1E',
        color: '#979292',
        confirmButtonColor: '#FF6B00',
        confirmButtonText: 'Guardar Cambios',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const nuevoNombre = document.getElementById('swal-edit-nombre').value;
            const nuevoEstado = document.getElementById('swal-edit-estado').value;
            
            if (!nuevoNombre) {
                Swal.showValidationMessage('El nombre no puede estar vacío');
            }
            return { nuevoNombre, nuevoEstado };
        }
    });

    if (formValues) {

        equipos = equipos.map(eq => {
            if (eq.id === id) {
                return { ...eq, nombre: formValues.nuevoNombre, estado: formValues.nuevoEstado };
            }
            return eq;
        });

        renderizarEquipos(equipos);

        Swal.fire({
            icon: 'success',
            title: 'Actualizado',
            text: 'Los datos se guardaron correctamente.',
            background: '#1E1E1E',
            color: '#979292',
            confirmButtonColor: '#198754'
        });
    }
};

botonesFiltro.forEach(boton => {
    boton.addEventListener('click', (e) => {

        botonesFiltro.forEach(b => {
            b.classList.remove('btn-brand');
            b.classList.add('btn-outline-light');
        });
        e.target.classList.remove('btn-outline-light');
        e.target.classList.add('btn-brand');

        const categoriaSeleccionada = e.target.dataset.categoria;
        
        if (categoriaSeleccionada === 'Todos') {
            renderizarEquipos(equipos);
        } else {
            const filtrados = equipos.filter(eq => eq.categoria === categoriaSeleccionada);
            renderizarEquipos(filtrados);
        }
    });
});


btnAgregar.addEventListener('click', async (e) => {
    e.preventDefault(); 

    const { value: formValues } = await Swal.fire({
        title: 'Ingresar Nuevo Equipo',
        html:
            '<input id="swal-nombre" class="swal2-input" placeholder="Nombre (Ej: Canon EOS R5)">' +
            '<select id="swal-categoria" class="swal2-select" style="width: 70%;">' +
                '<option value="Cámaras">Cámaras</option>' +
                '<option value="Iluminación">Iluminación</option>' +
                '<option value="Sonido">Sonido</option>' +
            '</select>',
        focusConfirm: false,
        background: '#1E1E1E',
        color: '#979292',
        confirmButtonColor: '#FF6B00',
        confirmButtonText: 'Registrar',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const nombre = document.getElementById('swal-nombre').value;
            const categoria = document.getElementById('swal-categoria').value;
            
            if (!nombre) {
                Swal.showValidationMessage('El nombre es obligatorio');
            }
            return { nombre, categoria };
        }
    });

    if (formValues) {

        const iconos = { 'Cámaras': '🎥', 'Iluminación': '💡', 'Sonido': '🎙️' };
        const nuevoEquipo = {
            id: equipos.length + 1,
            nombre: formValues.nombre,
            categoria: formValues.categoria,
            estado: 'DISPONIBLE',
            icono: iconos[formValues.categoria]
        };
        
   
        equipos.push(nuevoEquipo);
        

        Swal.fire({
            title: 'Guardando en la base de datos...',
            timer: 1000,
            timerProgressBar: true,
            background: '#1E1E1E',
            color: '#fff',
            didOpen: () => { Swal.showLoading() }
        }).then(() => {

            renderizarEquipos(equipos); 
            document.querySelector('[data-categoria="Todos"]').click();
            
            Swal.fire({
                icon: 'success',
                title: 'Equipo Agregado',
                text: `${formValues.nombre} ya está disponible.`,
                background: '#1E1E1E',
                color: '#fff',
                confirmButtonColor: '#198754'
            });
        });
    }
});


cargarEquipos();