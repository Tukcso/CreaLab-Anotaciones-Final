const gridProyectos = document.getElementById('grid-proyectos');
let proyectosData = [];

// 1. Motor de Base de Datos (Persistencia)
const cargarProyectos = async () => {
    try {
        const dbLocal = localStorage.getItem('crealab_db');
        
        if (dbLocal) {
            proyectosData = JSON.parse(dbLocal);
        } else {
            const res = await fetch('../data/proyectos.json');
            proyectosData = await res.json();
            actualizarDB();
        }
        renderizarProyectos();
    } catch (error) {
        console.error("Error inicializando Dashboard:", error);
    }
};

const actualizarDB = () => {
    localStorage.setItem('crealab_db', JSON.stringify(proyectosData));
};

// 2. Renderizado Dinámico
const renderizarProyectos = () => {
    gridProyectos.innerHTML = '';
    
    proyectosData.forEach(p => {
        const textColor = p.badgeColor === 'warning' ? 'text-dark' : '';
        
        gridProyectos.innerHTML += `
            <article class="col-12 col-md-6 col-lg-4">
                <div class="card card-custom h-100 neon-${p.badgeColor} card-hover shadow-sm overflow-hidden" onclick="entrarProyecto('${p.id}')" style="cursor: pointer;">
                    
                    <img src="${p.imagen}" alt="Portada ${p.titulo}" class="card-img-top object-fit-cover" style="height: 180px;">
                    
                    <div class="card-body p-4 d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h2 class="h5 text-white fw-bold mb-0">${p.titulo}</h2>
                            <span class="badge bg-${p.badgeColor} ${textColor}">${p.estadoBadge}</span>
                        </div>
                        <p class="txt-gray small mb-4">${p.desc}</p>
                        
                        <div class="mt-auto border-top border-secondary pt-3 d-flex justify-content-between align-items-center">
                            <div class="d-flex gap-2">
                                <button class="btn btn-sm btn-outline-secondary" onclick="event.stopPropagation(); crudProyecto('editar', '${p.id}')">✏️ Editar</button>
                                <button class="btn btn-sm btn-outline-danger" onclick="event.stopPropagation(); eliminarProyecto('${p.id}')">🗑️ Quitar</button>
                            </div>
                            <span class="txt-brand fw-bold">Entrar &rarr;</span>
                        </div>
                    </div>
                </div>
            </article>
        `;
    });
};

// 3. Navegación
const entrarProyecto = (idProyecto) => {
    localStorage.setItem('proyectoActivo', idProyecto);
    window.location.href = './workspace.html';
};

// 4. CRUD: Eliminar
const eliminarProyecto = async (id) => {
    const confirmacion = await Swal.fire({
        title: '¿Eliminar Proyecto?',
        text: 'Se borrará el proyecto y todo su contenido de la base de datos. Esta acción es irreversible.',
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
        proyectosData = proyectosData.filter(p => p.id !== id);
        actualizarDB();
        renderizarProyectos();
        
        Swal.fire({ 
            icon: 'success', 
            title: 'Proyecto Eliminado', 
            background: '#1E1E1E', 
            color: '#979292', 
            showConfirmButton: false, 
            timer: 1500 
        });
    }
};

// 5. CRUD: Agregar y Modificar (ACTUALIZADO PARA SUBIR IMÁGENES LOCALES)
const crudProyecto = async (accion, id = null) => {
    let item = id ? proyectosData.find(p => p.id === id) : { titulo: '', desc: '', imagen: '../assets/img/default.jpg', estadoBadge: 'PRE-PROD', badgeColor: 'danger' };
    
    const { value: formValues } = await Swal.fire({
        title: accion === 'agregar' ? 'Crear Nuevo Proyecto' : 'Modificar Proyecto',
        background: '#1E1E1E',
        color: '#979292',
        showCancelButton: true,
        confirmButtonColor: '#FF6B00',
        cancelButtonColor: '#333333',
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        html: `
            <input id="sw-titulo" class="swal2-input mb-2" placeholder="Título del Proyecto" value="${item.titulo}">
            <input id="sw-desc" class="swal2-input mb-2" placeholder="Descripción breve" value="${item.desc}">
            
            <label class="text-white small mt-3 d-block text-start px-4">Portada (Si no subes nada, se mantiene la actual)</label>
            <input type="file" id="sw-img" class="swal2-file mt-1 mb-2" accept="image/*" style="width: 70%; margin: 0 auto; display: block; color: #979292;">
            
            <label class="text-white small mt-2 d-block text-start px-4">Estado del Proyecto</label>
            <select id="sw-est" class="swal2-select mt-0 mb-2" style="width: 70%;">
                <option value="PRE-PROD|danger" ${item.estadoBadge === 'PRE-PROD' ? 'selected' : ''}>PRE-PROD</option>
                <option value="EN RODAJE|warning" ${item.estadoBadge === 'EN RODAJE' ? 'selected' : ''}>EN RODAJE</option>
                <option value="FINALIZADO|success" ${item.estadoBadge === 'FINALIZADO' ? 'selected' : ''}>FINALIZADO</option>
            </select>
        `,
        // Cambiamos preConfirm para manejar el asincronismo de leer el archivo
        preConfirm: () => {
            return new Promise((resolve) => {
                const titulo = document.getElementById('sw-titulo').value;
                if (!titulo) {
                    Swal.showValidationMessage('El título es obligatorio');
                    resolve(false);
                    return;
                }
                
                const estadoSelect = document.getElementById('sw-est').value.split('|');
                const fileInput = document.getElementById('sw-img');
                const file = fileInput.files[0];

                const construirObjeto = (imagenData) => ({
                    id: id || 'proj-' + Date.now(),
                    titulo: titulo,
                    desc: document.getElementById('sw-desc').value || 'Sin descripción',
                    imagen: imagenData,
                    estadoBadge: estadoSelect[0],
                    badgeColor: estadoSelect[1],
                    rodaje: id ? item.rodaje : [],
                    arte: id ? item.arte : [],
                    elenco: id ? item.elenco : []
                });

                // Si el usuario seleccionó una imagen, la transformamos a texto (Base64)
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(construirObjeto(e.target.result));
                    reader.readAsDataURL(file);
                } else {
                    // Si no subió nada, mantenemos la imagen que ya tenía
                    resolve(construirObjeto(item.imagen));
                }
            });
        }
    });

    if (formValues) {
        if (accion === 'agregar') {
            proyectosData.push(formValues);
        } else {
            proyectosData = proyectosData.map(p => p.id === id ? formValues : p);
        }
        
        actualizarDB();
        renderizarProyectos();
        
        Swal.fire({ 
            icon: 'success', 
            title: accion === 'agregar' ? 'Proyecto Creado' : 'Cambios Guardados', 
            background: '#1E1E1E', 
            color: '#979292', 
            showConfirmButton: false, 
            timer: 1500 
        });
    }
};


cargarProyectos();