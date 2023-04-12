const url = "https://digimon-api.vercel.app/api/digimon"
const select = document.querySelector("#select-nombres")
const tarjeta = document.querySelector("#tarjeta")

async function extraer_nombres() {
    let response = await fetch(url)
    let datos = await response.json()
    let indices = Object.keys(datos)
    select.innerHTML = '<option selected value="0"><b>Seleccione un digimon</b></option>'
    indices.forEach((idx) => {
        select.innerHTML += /*html*/`
            <option value="${datos[idx].name}">${datos[idx].name}</option>
        `
    })
    return indices.length
}
extraer_nombres()
    .then( () => {
        
        function ajustarTamanoSelect() {
            let screenWidth = window.innerWidth // Obtener ancho de la pantalla
            select.size = 2
            let optionHeight = select.querySelector("option").offsetHeight
            if (select.value == 0) {
                let optionsToShow = Math.min(select.length, Math.floor(window.innerHeight * 0.7 / optionHeight)) // Calcular el número de opciones que se deben mostrar
                select.size = optionsToShow
            } else if (screenWidth >= 992) {
                let optionsToShow = Math.min(select.length, Math.floor(window.innerHeight * 0.5 / optionHeight)) // Calcular el número de opciones que se deben mostrar
                select.size = optionsToShow
            } else {
                select.removeAttribute("size")
            }
        }
        ajustarTamanoSelect(); // Llamada inicial para ajustar el tamaño en carga
        window.addEventListener("resize", ajustarTamanoSelect); // Escuchar eventos de cambio de tamaño de ventana
    })

async function extrae_digimon(nombre) {
    let path = "/name"
    let response = await fetch(url + path + "/" + encodeURIComponent(nombre))
    let datos = await response.json()
    let { name, level, img } = datos[0]
    let nombre_digimon = document.querySelector("#nombre-digimon")
    let nivel_digimon = document.querySelector("#nivel-digimon")
    let imagen_digimon = document.querySelector("#imagen-digimon")
    nombre_digimon.innerHTML = `<h4>${name}</h4>`
    imagen_digimon.src = img
    nivel_digimon.innerHTML = `<b>Nivel: </b>${level}`
}
select.addEventListener('change', function (event) {
    event.target.size = 2
    if (event.target.value == 0) {
        tarjeta.className = "d-none"
        let optionHeight = event.target.querySelector("option").offsetHeight
        let optionsToShow = Math.min(event.target.length, Math.floor(window.innerHeight * 0.7 / optionHeight)) // Calcular el número de opciones que se deben mostrar
        select.size = optionsToShow
    } else if (window.innerWidth >= 992) {
        let optionHeight = event.target.querySelector("option").offsetHeight
        let selectHeight = Math.floor(window.innerHeight * 0.5) // Obtener alto deseado del select
        let optionsToShow = Math.min(select.querySelectorAll("option").length, Math.floor(selectHeight / optionHeight)) // Calcular el número de opciones que se deben mostrar
        select.size = optionsToShow
        extrae_digimon(event.target.value)
        tarjeta.className = "col d-block"
    } else {
        select.removeAttribute("size")
        extrae_digimon(event.target.value)
        tarjeta.className = "col d-block"
    }
})

