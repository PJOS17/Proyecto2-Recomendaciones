// ==========================================
// Script Cypher: Creación de Nodos y Relaciones para el Proyecto VIBES
// ==========================================
// PROPÓSITO: Define la estructura del grafo en la base de datos Neo4j para
// el sistema de recomendaciones musicales de VIBES.
// FUNCIONA: Crea nodos (usuarios, artistas, géneros, canciones) y
// relaciones entre ellos (ESCUCHA, COMPUESTA_POR, PERTENECE_A).
// USO: Ejecutar en la consola de Neo4j Browser o Neo4j Aura.
// ==========================================

// 1. LIMPIAR BASE DE DATOS
// Borra TODOS los nodos y sus relaciones existentes en la BD
// MATCH (n) selecciona todos los nodos; DETACH DELETE elimina el nodo Y sus relaciones
// ⚠️ CUIDADO: Esto borra TODO. Solo ejecutar para empezar desde cero.
MATCH (n) DETACH DELETE n;

// 2. CREAR NODOS Y RELACIONES
// En Neo4j, los nodos se crean con CREATE y se les asigna una etiqueta (tipo) y propiedades
CREATE 
  // ---- NODO USUARIO ----
  // Representa a un usuario de la aplicación
  // Etiqueta: "Usuario", Propiedad: "nombre" (nombre completo del usuario)
  (marco:Usuario {nombre: "Marco Soloj"}),
  
  // ---- NODOS ARTISTAS ----
  // Representan artistas/grupos musicales
  // Etiqueta: "Artista", Propiedad: "nombre" (nombre artístico)
  (weeknd:Artista {nombre: "The Weeknd"}),     // The Weeknd - Pop/R&B
  (metro:Artista {nombre: "Metro Boomin"}),     // Metro Boomin - Productor/Trap
  (dua:Artista {nombre: "Dua Lipa"}),           // Dua Lipa - Pop/Dance
  (ariana:Artista {nombre: "Ariana Grande"}),    // Ariana Grande - Pop/R&B
  
  // ---- NODOS GÉNEROS ----
  // Representan géneros musicales
  // Etiqueta: "Genero", Propiedad: "nombre" (nombre del género)
  (pop:Genero {nombre: "Pop"}),        // Pop - Género popular
  (rnb:Genero {nombre: "R&B"}),        // R&B - Rhythm and Blues
  (synth:Genero {nombre: "Synthpop"}), // Synthpop - Pop con sintetizadores
  
  // ---- NODOS CANCIONES (HISTORIAL) ----
  // Canciones que el usuario ya ha escuchado (para saber sus gustos)
  // Etiqueta: "Cancion", Propiedad: "titulo"
  (starboy:Cancion {titulo: "Starboy"}),           // Ya escuchada por el usuario
  (die:Cancion {titulo: "Die For You"}),            // Ya escuchada por el usuario
  (save:Cancion {titulo: "Save Your Tears"}),       // Ya escuchada por el usuario
  
  // ---- NODOS CANCIONES (CATÁLOGO PARA RECOMENDAR) ----
  // Canciones que el usuario AÚN NO ha escuchado y que el algoritmo puede recomendar
  (blinding:Cancion {titulo: "Blinding Lights"}),   // Candidata a recomendación
  (creepin:Cancion {titulo: "Creepin'"}),            // Candidata a recomendación
  (levitating:Cancion {titulo: "Levitating"}),       // Candidata a recomendación
  (dieremix:Cancion {titulo: "Die For You (Remix)"}) // Candidata a recomendación

// 3. CREAR RELACIONES (El ADN del grafo de recomendaciones)
// Las relaciones conectan nodos entre sí y definen cómo se relacionan
CREATE
  // ---- HISTORIAL DE ESCUCHAS DE MARCO ----
  // Relación [:ESCUCHA]: indica que el usuario ha escuchado una canción
  // La flecha (->) indica dirección: Marco ESCUCHA la canción
  (marco)-[:ESCUCHA]->(starboy),   // Marco ha escuchado "Starboy"
  (marco)-[:ESCUCHA]->(die),       // Marco ha escuchado "Die For You"
  (marco)-[:ESCUCHA]->(save),      // Marco ha escuchado "Save Your Tears"
  
  // ---- CONEXIONES DE CANCIONES ESCUCHADAS ----
  // Relación [:COMPUESTA_POR]: indica quién compuso/interpreta la canción
  (starboy)-[:COMPUESTA_POR]->(weeknd),   // "Starboy" es de The Weeknd
  // Relación [:PERTENECE_A]: indica a qué género(s) pertenece la canción
  (starboy)-[:PERTENECE_A]->(rnb),        // "Starboy" es R&B
  (starboy)-[:PERTENECE_A]->(pop),        // "Starboy" también es Pop (puede tener múltiples géneros)
  
  (die)-[:COMPUESTA_POR]->(weeknd),       // "Die For You" es de The Weeknd
  (die)-[:PERTENECE_A]->(rnb),            // "Die For You" es R&B
  
  (save)-[:COMPUESTA_POR]->(weeknd),      // "Save Your Tears" es de The Weeknd
  (save)-[:PERTENECE_A]->(synth),         // "Save Your Tears" es Synthpop
  
  // ---- CONEXIONES DEL CATÁLOGO A RECOMENDAR ----
  // Estas canciones están conectadas al mismo artista/género que las que Marco escuchó
  // El algoritmo las encontrará porque comparten "características" (nodos intermedios)
  (blinding)-[:COMPUESTA_POR]->(weeknd),  // "Blinding Lights" es de The Weeknd (mismo artista)
  (blinding)-[:PERTENECE_A]->(synth),     // "Blinding Lights" es Synthpop (mismo género que "Save Your Tears")
  
  (creepin)-[:COMPUESTA_POR]->(metro),    // "Creepin'" es de Metro Boomin
  (creepin)-[:COMPUESTA_POR]->(weeknd),   // "Creepin'" TAMBIÉN es de The Weeknd (colaboración)
  (creepin)-[:PERTENECE_A]->(rnb),        // "Creepin'" es R&B
  
  (levitating)-[:COMPUESTA_POR]->(dua),   // "Levitating" es de Dua Lipa (artista diferente)
  (levitating)-[:PERTENECE_A]->(pop),     // "Levitating" es Pop (mismo género que "Starboy")
  (levitating)-[:PERTENECE_A]->(synth),   // "Levitating" también es Synthpop
  
  (dieremix)-[:COMPUESTA_POR]->(weeknd),  // "Die For You (Remix)" es de The Weeknd
  (dieremix)-[:COMPUESTA_POR]->(ariana),  // y Ariana Grande (colaboración)
  (dieremix)-[:PERTENECE_A]->(rnb);       // Es R&B
