// objetos del dom
const url = "https://digimon-api.vercel.app/api/digimon"
const select_nombre = document.querySelector("#select-nombres")
const select_nivel = document.querySelector("#select-nivel")
const tarjeta = document.querySelector("#tarjeta")
const input_buscar = document.querySelector("#buscar")
const miniaturas = document.querySelector("#miniaturas")
const changeEvent = new Event("change") // crear evento de cambio

// lista objetos de clase digimon
let lista_digimon = []

// primera extracción de objetos de la api con nombre y nivel
async function extrae_lista_digimon() {
    let response = await fetch(url)
    let datos = await response.json()
    let indices = Object.keys(datos)
    lista_digimon = indices.map(indice => ({ nombre: datos[indice].name, nivel: datos[indice].level, imagen: datos[indice].img }))
}

extrae_lista_digimon()
    .then(() => {
        // teniendo los objetos, los agrego a los select
        iniciar_selector(select_nombre, "Seleccione un Digimon (Mostrar todos)")
        iniciar_selector(select_nivel, "Seleccione nivel (Mostrar todos)")
        let niveles = Array.from(new Set(lista_digimon.map(el => el.nivel))).filter(nivel => nivel !== undefined).sort()
        let nombres = Array.from(new Set(lista_digimon.map(el => el.nombre))).filter(nombre => nombre !== undefined).sort()
        niveles.forEach(nivel => {
            select_nivel.innerHTML += /*html*/`
        <option value="${nivel}">${nivel}</option>
        `
        })
        nombres.forEach(nombre => {
            select_nombre.innerHTML += /*html*/`
        <option value="${nombre}">${nombre}</option>
        `
        })

        ajustarTamanoSelect(); // Llamada inicial para ajustar el tamaño en carga
        window.addEventListener("resize", ajustarTamanoSelect); // Escuchar eventos de cambio de tamaño de ventana

        // listener para cambio en selección de digimon
        select_nombre.addEventListener('change', function (event) {
            let digimon_seleccionado = event.target.value
            if (digimon_seleccionado == 0) {
                tarjeta.className = "d-none"
                input_buscar.value = ""
                select_nivel.selectedIndex = 0;
                select_nivel.dispatchEvent(changeEvent) // disparar evento de cambio
            } else {
                extrae_digimon(event.target.value)
                tarjeta.className = "col d-block"
            }
            ajustarTamanoSelect()
        })

        // Listener para cambio en select nombre según nivel
        select_nivel.addEventListener('change', (e) => {
            input_buscar.value = ""
            tarjeta.className = "d-none"
            let nivel_buscado = e.target.value
            let nombres_filtrados = []
            if (nivel_buscado == 0) {
                nombres_filtrados = lista_digimon.map(el => el.nombre).filter(nombre => nombre !== undefined).sort()
            } else {
                nombres_filtrados = lista_digimon.filter(el => el.nivel === nivel_buscado).map(el => el.nombre).sort()
            }
            iniciar_selector(select_nombre, "Seleccione un Digimon (Mostrar todos)", "0", true)
            nombres_filtrados.forEach(nombre => {
                select_nombre.innerHTML += /*html*/`
                    <option value="${nombre}">${nombre}</option>
                `
            })
            cargar_miniaturas()
            ajustarTamanoSelect()
        })

        // Event listener para el campo de búsqueda
        input_buscar.addEventListener("keyup", () => {
            let consulta = input_buscar.value.toLowerCase() // Convertir la consulta a minúsculas

            // reseteo select_nombre
            let nombres_filtrados = []
            if (select_nivel.value == 0) {
                nombres_filtrados = lista_digimon.map(el => el.nombre).filter(nombre => nombre !== undefined).sort()
            } else {
                nombres_filtrados = lista_digimon.filter(el => el.nivel === select_nivel.value).map(el => el.nombre).sort()
            }
            iniciar_selector(select_nombre, "Seleccione un Digimon (Mostrar todos)")
            nombres_filtrados.forEach(nombre => {
                select_nombre.innerHTML += /*html*/`
                    <option value="${nombre}">${nombre}</option>
                `
            })

            // Filtrar las opciones del select
            let opciones_filtradas = Array.from(select_nombre.options).filter((opcion) => {
                return opcion.text.toLowerCase().startsWith(consulta)
            })

            // Actualizar el select con las opciones filtradas
            select_nombre.innerHTML = ""
            if (input_buscar.value.length > 0) {
                iniciar_selector(select_nombre, "Seleccione un Digimon (Mostrar todos)")
            }
            opciones_filtradas.forEach(function (opcion) {
                select_nombre.appendChild(opcion)
            });
            ajustarTamanoSelect()
            cargar_miniaturas()
        });

        cargar_miniaturas()

    })

function iniciar_selector(selector, mensaje, valor = "0", selected = false) {
    selector.innerHTML = `<option value=${valor}>${mensaje}</option>`
    if (selected) {
        select_nombre.value = valor
    }
}

// calcula tamaño de caja de opciones en los selects
function calcular_opciones(selector, vh_pantalla) {
    selector.size = 2
    let optionHeight = selector.querySelector("option").offsetHeight
    return Math.min(selector.length, Math.floor(window.innerHeight * vh_pantalla / optionHeight))
}

// ajusta tamaño de los select
function ajustarTamanoSelect() {
    let screenWidth = window.innerWidth // Obtener ancho de la pantalla
    if (select_nombre.value == 0) {
        select_nombre.size = calcular_opciones(select_nombre, 0.5)
        select_nivel.size = calcular_opciones(select_nivel, 0.2)
    } else if (screenWidth >= 992) {
        select_nombre.size = calcular_opciones(select_nombre, 0.4)
        select_nivel.size = calcular_opciones(select_nivel, 0.2)
    } else {
        select_nombre.removeAttribute("size")
        select_nivel.removeAttribute("size")
    }
}

// función para extraer datos del digimon seleccionado a la tarjeta
async function extrae_digimon(nombre) {
    let path = `/name/` + encodeURIComponent(nombre)
    let response = await fetch(url + path)
    let datos = await response.json()
    let { name, level, img } = datos[0]
    tarjeta.querySelector("#nombre-digimon").innerHTML = `<h4>${name}</h4>`
    tarjeta.querySelector("#nivel-digimon").innerHTML = `<b>Nivel: </b>${level}`
    tarjeta.querySelector("#imagen-digimon").src = img
}

function cargar_miniaturas() {
    // reseteo miniaturas
    let digimones = []
    if (select_nivel.value == 0) {
        digimones = lista_digimon.filter(el => {
            return el.nombre !== undefined
        })
    } else {
        digimones = lista_digimon.filter(el => {
            return (el.nivel !== undefined && el.nivel === select_nivel.value);
        });
    }
    digimones = digimones.filter( el => Array.from(select_nombre.options).slice(1).map(el => el.text ).includes(el.nombre))
    digimones.sort((a, b) => {
        if (a.nombre < b.nombre) {
            return -1;
        }
        if (a.nombre > b.nombre) {
            return 1;
        }
        return 0;
    })
    miniaturas.innerHTML = ""
    digimones.forEach(el => {
        miniaturas.innerHTML += `<img src="${el.imagen}"
            class="img-thumbnail" alt="imagen digimon"
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            data-bs-title="${el.nombre}">`
    })
    // habilitar tooltips para miniaturas
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

    const images = document.querySelectorAll('#miniaturas img');
    images.forEach((element) => {
        element.addEventListener('click', (el) => {
            let nombre_tooltip = el.target.dataset.bsTitle
            select_nombre.value = nombre_tooltip
            extrae_digimon(nombre_tooltip)
            tarjeta.className = "col d-block"
        })
    })
}
