const d = document

//Obtengo la clave para usar la api y la almaceno en una constante. También creo constantes para la manipulación del DOM
const apiKey = 'dbb0c93f';
const botonBuscar = d.getElementById('boton-buscar');
const containerPeliculas = d.getElementById('mostrar-peliculas');

//Creo funcion encargada del fetch. Se eligió hacer en forma de funcion y no un eventlistener directo para despues agregar que el usuario pueda buscar al tocar enter 
const buscarPeliculas = async () => {
    //Obtengo el valor del input del buscador
    const input = d.getElementById('input').value;

    //Creo un bloque try catch para manejar peticiones y errores
    try {
        //endPoint = url de la api. En esta sebe ingresar la clave de la misma y recibiendo por get el valor de s, en este caso, lo que ingresa el usuario
        const endPoint = `https://www.omdbapi.com/?apikey=${apiKey}&s=${input}`;
        //Hago un fetch o llamada a esa url con await debido a las promesas
        const resp = await fetch(endPoint);
        //Si esa llamada no es correcta se indica por consola. Este console.error, salta si la ruta no es correcta, puede ser por cambio de apiKey o por equivocacion en la url
        if(!resp.ok){
            console.error('Hubo un error en la ruta')
        }
        //Almaceno la respuesta (en caso de ser correcta) en forma de JSON en la variable data
        const data = await resp.json();
        console.log(data);

        //Este bloque de código esta creado para obtener más valores de cada película
        //Al hacer console.log de data obtenemos una clave que es Response. En caso de que data no obtenga valores, el valor de esta clave en 'False', sino 'True'.
        //Por eso este bloque indica que si la respuesta es verdadera, se ejecute el codigo de adentro
        if (data.Response === 'True') {
            //Creo variable que por medio de un Promise.all y un data.Search obtienen el imdbID de cada peliculas
            //Promise.all toma el array de promesas devuelto por la llamada a masDetalles y devuelve una sola promesa (en forma de array), por eso se utiliza el await que se resuelve cuando todas las promesas del array estan resueltas
            //data.Search = data es la variable que contiene el json con las peliculas y Search es una propiedad que contiene que es un array de peliculas que coinciden con la busqueda
            //.map crea un nuevo array con los resultados de la llamada a la función indicada aplicados a cada uno de sus elementos. Es decir que sobre cada pelicula (peli = cada elemento del array data.Search) va aplicar la callback funcion y va a devolver otro array
            const peliculasDetalladas = await Promise.all(data.Search.map(peli => masDetalles(peli.imdbID)));
            console.log(peliculasDetalladas);
            //peliculasDetalladas muestra un array con las peliculas mostradas. Estas contienen mas información, por eso se hace esto
            mostrarPeliculas(peliculasDetalladas);
        } else {
            //Muestro error si no hay resultados
            containerPeliculas.innerHTML = '<div class="w-1/2 mx-auto text-red-700 p-4 mt-5 rounded-lg bg-red-200"><h3 class="text-center text-2xl">No se encontraron resultados</h3></div>';
        }
        //Alerta con modal que indica que el valor del input esta vacio
    } catch (err) {
        console.error('Hubo un error');
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Ingresa el nombre de una película",
        });
    }
};

//Se le asigna la funcion anterior al boton
botonBuscar.addEventListener('click', (buscarPeliculas))

//1° Funcion: Se encarga de recibir el id que tienen todas las peliculas en esta API, el cual nos permite acceder a mas detalles de las mismas
const masDetalles = async (imdbID) => {
    const endPoint = `http://www.omdbapi.com/?apikey=${apiKey}&i=${imdbID}`;
    const resp = await fetch(endPoint);
    if(!resp.ok){
        console.error('La respuesta no es correcta')
    }
    return await resp.json();
    // Devuelve el array con todas las peliculas y sus detalles despues de resolver por meddio de fetchs y promesas
}

//Limpio e contenido anteriro, en caso que haya, y muestro las peliculas buscadas iterando el parametro recibido por medio de un foreach. El parametro recibido es el que se obtiene al usar el metodo map anteriormente 
function mostrarPeliculas(peliculas){
    containerPeliculas.innerHTML = '';
        peliculas.forEach(peli => {
            // console.log(JSON.stringify(peli))
            containerPeliculas.innerHTML += `<article class="tarjeta">
            <div class="tarjeta-preview">
                <img src="${peli.Poster}" alt="${peli.Title}">
                <div class="tarjeta-rating flex"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#eab308" d="m8.85 16.825l3.15-1.9l3.15 1.925l-.825-3.6l2.775-2.4l-3.65-.325l-1.45-3.4l-1.45 3.375l-3.65.325l2.775 2.425zm3.15.45l-4.15 2.5q-.275.175-.575.15t-.525-.2t-.35-.437t-.05-.588l1.1-4.725L3.775 10.8q-.25-.225-.312-.513t.037-.562t.3-.45t.55-.225l4.85-.425l1.875-4.45q.125-.3.388-.45t.537-.15t.537.15t.388.45l1.875 4.45l4.85.425q.35.05.55.225t.3.45t.038.563t-.313.512l-3.675 3.175l1.1 4.725q.075.325-.05.588t-.35.437t-.525.2t-.575-.15zm0-5.025"/></svg> ${peli.imdbRating}/10</div>
            </div>
            <div class="tarjeta-contenido">
                <h2 class="tarjeta-titulo">${peli.Title}</h2>
                <p class="tarjeta-director"><b>Director:</b> ${recortarDirectores(peli.Director)}</p>
                <p class="tarjeta-descripcion">${recortarDescripcion(peli.Plot)}</p>
                <a data-pelicula='${JSON.stringify(peli)}' class="boton-modal bg-emerald-700 text-xl font-extrabold text-white p-2 mt-2 mb-2 rounded-lg w-fit">Ver Detalles</a>
                <div class="tarjeta-propiedades text-center">${peli.Year} | ${recortarPaises(peli.Country)} | ${peli.Runtime}</div>

            </div>
            </article>`;
        });
        containerPeliculas.classList.add('tarjetas');
};
//Al botón se le agregó un atributo data-pelicula con el valor del JSON en modo de cadena. Es decir todos los valores del JSON de cada pelicula.
//Esto se hace para obtener los datos en la siguiente funcion, para poder utilizar los datos en el modal

let modal = d.getElementById('modal')

//Al no poder acceder directamente al dom del boton se escuchan los clicks del container de peliculas pero adentro de este se hace una condicion en la cual se pregunta si donde se hizo click contiene la clase boton-modal. En ese caso, creo la variable pelicula en la cual se pasa la cadena de texto a formato JSON (se obtiene por el dataset.pelicula). Despues jecuta la funcion mostrarModal pasandole la pelicula como paramtro
containerPeliculas.addEventListener('click', (e) => {
    if (e.target.classList.contains('boton-modal')) {
        const pelicula = JSON.parse(e.target.dataset.pelicula);
        // console.log(pelicula)
        // Llama a una función para mostrar los detalles de la película con el IMDb ID correspondiente
        mostrarModal(pelicula)
    }
});

//Creo el modal
function mostrarModal(peli){
    modal.innerHTML = `
    <div class="modal-body flex">
        <div class="mr-2">
            <img src="${peli.Poster}" alt="${peli.Title}" class="rounded-lg">
        </div>
        <div class="w-2/4">
        <h2 class="text-3xl font-bold mb-4">${peli.Title}</h2>
        <p class="mb-4"><b>Resumen:</b> ${peli.Plot}</p>
        <p class="mb-4"><b>Director:</b> ${peli.Director}</p>
        <p class="mb-4"><b>Año:</b> ${peli.Year}</p>
        <p class="mb-4"><b>País/es:</b> ${peli.Country}</p>
        <p class="mb-4"><b>Duración:</b> ${peli.Runtime}</p>
        <div class="valoracion flex m-auto bg-slate-500 rounded-lg text-white w-fit p-2 text-xl items-center"><svg class="svg" xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24"><path fill="#eab308" d="m8.85 16.825l3.15-1.9l3.15 1.925l-.825-3.6l2.775-2.4l-3.65-.325l-1.45-3.4l-1.45 3.375l-3.65.325l2.775 2.425zm3.15.45l-4.15 2.5q-.275.175-.575.15t-.525-.2t-.35-.437t-.05-.588l1.1-4.725L3.775 10.8q-.25-.225-.312-.513t.037-.562t.3-.45t.55-.225l4.85-.425l1.875-4.45q.125-.3.388-.45t.537-.15t.537.15t.388.45l1.875 4.45l4.85.425q.35.05.55.225t.3.45t.038.563t-.313.512l-3.675 3.175l1.1 4.725q.075.325-.05.588t-.35.437t-.525.2t-.575-.15zm0-5.025"/></svg> ${peli.imdbRating}/10</div>

</div>
        </div>
    `;
    modal.style.display = 'block';
}


d.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    // modal.style.display = 'none'
    }
});

function closeModal(){
    modal.style.display = 'none'
}

//Eventos para borrar input entero
let svgBorrar = d.getElementById('borrar');
let input = d.getElementById('input');

input.addEventListener('input', () => {
    if(input.value){
        svgBorrar.classList.remove('hidden')
    }else{
        svgBorrar.classList.add('hidden')
    }
})

svgBorrar.addEventListener('click', () => {
        input.value = '';
})

//Evento para buscar con enter
input.addEventListener('keydown', (e) => {
    if(e.key === 'Enter'){
        buscarPeliculas();
    }
})

//Funciones para estilizar las tarjetas. Esa info faltante se muestra al tocar el boton, en el modal
function recortarDescripcion(textoCompleto){
    let arrayTexto = textoCompleto.split(" ");

    if(arrayTexto.length > 15){
        arrayTexto = arrayTexto.slice(0, 15)
        return arrayTexto.join(" ") + '...';
    }
        return textoCompleto
}

function recortarDirectores(directores){
    let muchosDirectores = directores.split(",")

    if(muchosDirectores.length > 1){
        muchosDirectores = muchosDirectores.slice(0, 1);
        return muchosDirectores + '...'
    }
    return directores
}

function recortarPaises(paises){
    let muchosPaises = paises.split(',');

    if (muchosPaises.length > 1){
        muchosPaises = muchosPaises.slice(0, 1);
        return muchosPaises + '...'
    }

    return paises
}