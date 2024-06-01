console.log('Esto es desde el Service Worker'); //Verifico en la consola que existe el archivo sw

//El self hace referencia a si mismo, es decir que escucha cunado se instala el SW
self.addEventListener('install', () =>{
    console.log('Capturamos el evento de instalación del SW 🆗')
})

self.addEventListener('activate', () => {
    console.log('Capturamos el evento de activacion del SW 🆗')
})

// Estos dos eventos se muestran una sola vez en el nabvegador (consola), cuando el usuario ingresa por primera vez. AL recargar la página no aparecen más a no ser que se borre el cache storage. 


//Al incluir tailwind por CDN, arrojaba un error en consola de CORS, y no permitia ver los estilos. Por eso con este fetch se le indica que adopte el modo no-cors para solucionar el error
fetch('https://cdn.tailwindcss.com/', {
    mode: 'no-cors'
})
.then(res => {
    console.log(res);
})
.catch(error => {
    console.error('Error:', error);
});
