# =============================================================================
# poblar_bd.py - Script para Poblar la Base de Datos Neo4j con Datos Iniciales
# =============================================================================
# PROPÓSITO: Crea la estructura completa del grafo de recomendaciones en Neo4j.
# FUNCIONA:
#   1. Se conecta a la base de datos Neo4j en la nube (AuraDB)
#   2. Borra todos los nodos y relaciones existentes (limpieza total)
#   3. Crea nodos: Usuarios, Artistas, Géneros y Canciones
#   4. Crea relaciones: ESCUCHA, COMPUESTA_POR, PERTENECE_A
# USO: python poblar_bd.py
# REQUISITO: pip install neo4j
# NOTA: Este script es equivalente a ejecutar crear_db_vibes.cypher pero desde Python
# =============================================================================

import os      # Módulo del sistema operativo (disponible por si se necesitan rutas de archivo)
import sys     # Módulo del sistema (para reconfigurar la salida estándar)

# Reconfigura la salida estándar (stdout) para usar codificación UTF-8
# Esto evita errores al imprimir emojis y caracteres especiales en la consola de Windows
sys.stdout.reconfigure(encoding='utf-8')

# Importa el driver oficial de Neo4j para Python
from neo4j import GraphDatabase

# ---- FUNCIÓN PRINCIPAL: POBLAR BASE DE DATOS ----
# Recibe las credenciales de conexión y crea todos los datos del grafo
def poblar_base_de_datos(uri, user, password):
    # Crea un driver de conexión a Neo4j con las credenciales proporcionadas
    # El driver maneja un pool de conexiones reutilizables
    driver = GraphDatabase.driver(uri, auth=(user, password))
    
    # Abre una sesión de trabajo con la base de datos
    with driver.session() as session:
        # PASO 1: Borra todo lo existente en la base de datos
        # MATCH (n) selecciona todos los nodos; DETACH DELETE elimina nodos y sus relaciones
        print("🧹 Borrando base de datos anterior (Limpiando grafo)...")
        session.run("MATCH (n) DETACH DELETE n")
        
        # Mensajes informativos de progreso
        print("🌱 Creando los Nodos (Usuarios, Artistas, Géneros, Canciones)...")
        print("🔗 Construyendo las Relaciones (El Historial y ADN de Recomendación)...")
        
        # PASO 2: Consulta Cypher que crea TODOS los nodos y relaciones de una sola vez
        # Triple comilla para cadena multilínea
        create_query = """
        CREATE 
          // ---- NODO USUARIO ----
          // Representa al usuario de prueba "Marco Soloj"
          (marco:Usuario {nombre: "Marco Soloj"}),
          
          // ---- NODOS ARTISTAS ----
          // Los artistas que forman parte del catálogo musical
          (weeknd:Artista {nombre: "The Weeknd"}),      // Pop/R&B
          (metro:Artista {nombre: "Metro Boomin"}),      // Productor/Trap
          (dua:Artista {nombre: "Dua Lipa"}),            // Pop/Dance
          (ariana:Artista {nombre: "Ariana Grande"}),     // Pop/R&B
          
          // ---- NODOS GÉNEROS ----
          // Categorías musicales que conectan canciones
          (pop:Genero {nombre: "Pop"}),         // Género Pop
          (rnb:Genero {nombre: "R&B"}),         // Rhythm and Blues
          (synth:Genero {nombre: "Synthpop"}),  // Pop con sintetizadores
          
          // ---- NODOS CANCIONES (HISTORIAL) ----
          // Canciones que el usuario ya escuchó - usadas para inferir sus gustos
          (starboy:Cancion {titulo: "Starboy"}),
          (die:Cancion {titulo: "Die For You"}),
          (save:Cancion {titulo: "Save Your Tears"}),
          
          // ---- NODOS CANCIONES (CATÁLOGO) ----
          // Canciones candidatas para recomendar (aún no escuchadas por el usuario)
          (blinding:Cancion {titulo: "Blinding Lights"}),
          (creepin:Cancion {titulo: "Creepin'"}),
          (levitating:Cancion {titulo: "Levitating"}),
          (dieremix:Cancion {titulo: "Die For You (Remix)"}),
          
          // ---- RELACIONES: HISTORIAL DE ESCUCHAS ----
          // Conecta al usuario con las canciones que ha escuchado
          (marco)-[:ESCUCHA]->(starboy),
          (marco)-[:ESCUCHA]->(die),
          (marco)-[:ESCUCHA]->(save),
          
          // ---- RELACIONES: CANCIONES ESCUCHADAS -> ARTISTAS Y GÉNEROS ----
          (starboy)-[:COMPUESTA_POR]->(weeknd),   // Starboy es de The Weeknd
          (starboy)-[:PERTENECE_A]->(rnb),        // Starboy es R&B
          (starboy)-[:PERTENECE_A]->(pop),        // Starboy también es Pop
          
          (die)-[:COMPUESTA_POR]->(weeknd),       // Die For You es de The Weeknd
          (die)-[:PERTENECE_A]->(rnb),            // Die For You es R&B
          
          (save)-[:COMPUESTA_POR]->(weeknd),      // Save Your Tears es de The Weeknd
          (save)-[:PERTENECE_A]->(synth),         // Save Your Tears es Synthpop
          
          // ---- RELACIONES: CATÁLOGO -> ARTISTAS Y GÉNEROS ----
          (blinding)-[:COMPUESTA_POR]->(weeknd),  // Blinding Lights es de The Weeknd
          (blinding)-[:PERTENECE_A]->(synth),     // Blinding Lights es Synthpop
          
          (creepin)-[:COMPUESTA_POR]->(metro),    // Creepin' es de Metro Boomin
          (creepin)-[:COMPUESTA_POR]->(weeknd),   // y The Weeknd (colaboración)
          (creepin)-[:PERTENECE_A]->(rnb),        // Creepin' es R&B
          
          (levitating)-[:COMPUESTA_POR]->(dua),   // Levitating es de Dua Lipa
          (levitating)-[:PERTENECE_A]->(pop),     // Levitating es Pop
          (levitating)-[:PERTENECE_A]->(synth),   // y Synthpop
          
          (dieremix)-[:COMPUESTA_POR]->(weeknd),  // Die For You Remix es de The Weeknd
          (dieremix)-[:COMPUESTA_POR]->(ariana),  // y Ariana Grande
          (dieremix)-[:PERTENECE_A]->(rnb)        // Es R&B
        """
        
        # Ejecuta la consulta Cypher completa en la base de datos
        session.run(create_query)
        # Mensaje de confirmación
        print("✅ ¡Base de datos VIBES creada con éxito! El sistema de recomendación ya tiene datos.")
        
    # Cierra el driver y libera las conexiones
    driver.close()

# ---- PUNTO DE ENTRADA PRINCIPAL ----
# __name__ == "__main__" solo se ejecuta cuando este archivo se corre directamente
# (no cuando se importa como módulo desde otro archivo)
if __name__ == "__main__":
    print("🚀 Script de Inicialización de VIBES")
    
    # ---- CREDENCIALES DE CONEXIÓN A NEO4J ----
    # Usa la nube gratuita de Neo4j (AuraDB) para que funcione en cualquier PC
    # sin necesidad de instalar Neo4j localmente
    URI = "neo4j+s://d544acc5.databases.neo4j.io"   # URI del servidor en la nube (protocolo seguro SSL)
    URI = "neo4j+s://d544acc5.databases.neo4j.io"   # (duplicado por error, se usa la última asignación)
    USER = "d544acc5"                                 # Nombre de usuario de la BD
    PASSWORD = "3JdyXlKfIxftHD0U9-jMTni7_DWovV10M2TNscwVU1k"  # Contraseña generada por Neo4j Aura
    
    try:
        # Llama a la función principal para poblar la base de datos
        poblar_base_de_datos(URI, USER, PASSWORD)
    except Exception as e:
        # Manejo de errores: muestra información útil para depuración
        print(f"\n❌ Error al intentar crear la base de datos: {e}")
        print("💡 Verifica que Neo4j esté corriendo y la contraseña sea correcta.")
