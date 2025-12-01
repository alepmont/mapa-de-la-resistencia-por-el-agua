// El mapa se carga desde Google My Maps
// Los marcadores y datos se gestionan directamente en Google My Maps

// Array de contenido para el panel lateral (noticias e Instagram)
// Se carga desde contenido.json
let contenido = [];

// Función para obtener la imagen y título de una noticia desde su URL
async function obtenerDatosDeNoticia(url) {
    try {
        // Usar un servicio proxy CORS o tu propio backend
        // Por ahora, intentamos extraer metadatos usando una API pública
        const response = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
        const data = await response.json();
        
        if (data.status === 'success') {
            return {
                imagen: data.data.image?.url || null,
                titulo: data.data.title || null,
                descripcion: data.data.description || null
            };
        }
        return null;
    } catch (error) {
        console.error('Error al obtener datos de la noticia:', error);
        return null;
    }
}

// Función para renderizar el contenido en el panel
async function renderizarContenido() {
    const newsSection = document.getElementById('news-section');
    newsSection.innerHTML = '';
    
    for (let index = 0; index < contenido.length; index++) {
        const item = contenido[index];
        
        if (item.tipo === 'noticia') {
            const newsItem = document.createElement('div');
            newsItem.className = 'news-item';
            newsItem.dataset.index = index;
            
            // Si hay link válido, intentar obtener datos automáticamente
            if (item.link && item.link !== '#') {
                const datosNoticia = await obtenerDatosDeNoticia(item.link);
                
                if (datosNoticia) {
                    // Actualizar imagen si no existe o es placeholder
                    if (!item.imagen || item.imagen.includes('placeholder')) {
                        item.imagen = datosNoticia.imagen || item.imagen;
                    }
                    
                    // Actualizar texto/título si no existe
                    if (!item.texto || item.texto.trim() === '') {
                        item.texto = datosNoticia.titulo || datosNoticia.descripcion || 'Sin título';
                    }
                }
            }
            
            const img = document.createElement('img');
            img.src = item.imagen || 'https://via.placeholder.com/300x200/1a1a2e/ffffff?text=Noticia';
            img.alt = `Noticia ${index + 1}`;
            img.loading = 'lazy'; // Carga perezosa para mejor rendimiento
            
            const p = document.createElement('p');
            p.textContent = item.texto || 'Sin título';
            
            newsItem.appendChild(img);
            newsItem.appendChild(p);
            
            // Agregar evento de clic
            if (item.link) {
                newsItem.style.cursor = 'pointer';
                newsItem.addEventListener('click', () => {
                    if (item.link !== '#') {
                        window.open(item.link, '_blank');
                    }
                });
            }
            
            newsSection.appendChild(newsItem);
            
        } else if (item.tipo === 'instagram') {
            const instagramEmbed = document.createElement('div');
            instagramEmbed.className = 'instagram-embed';
            instagramEmbed.dataset.index = index;
            
            const blockquote = document.createElement('blockquote');
            blockquote.className = 'instagram-media';
            blockquote.setAttribute('data-instgrm-permalink', item.url);
            blockquote.setAttribute('data-instgrm-version', '14');
            
            instagramEmbed.appendChild(blockquote);
            newsSection.appendChild(instagramEmbed);
        }
    }
    
    // Reiniciar el script de Instagram para procesar los nuevos embeds
    if (window.instgrm) {
        window.instgrm.Embeds.process();
    }
}

// Función para cargar contenido desde un archivo JSON
async function cargarContenidoDesdeJSON(url = 'contenido.json') {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error('No se pudo cargar el JSON:', response.status);
            return false;
        }
        const data = await response.json();
        if (data && data.length > 0) {
            contenido = data;
            await renderizarContenido();
            console.log('Contenido cargado exitosamente desde:', url);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error al cargar JSON:', error);
        return false;
    }
}

// Animación de entrada para las barras estadísticas (si existen)
window.addEventListener('load', async () => {
    const statFills = document.querySelectorAll('.stat-fill');
    statFills.forEach((fill, index) => {
        setTimeout(() => {
            fill.style.width = fill.style.width;
        }, index * 100);
    });
    
    // Cargar desde contenido.json
    await cargarContenidoDesdeJSON();
});

// Función global para actualizar contenido
window.actualizarContenido = function(nuevoContenido) {
    contenido = nuevoContenido;
    renderizarContenido();
};