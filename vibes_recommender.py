# =============================================================================
# vibes_recommender.py - Motor de Recomendaciones Musicales con Grafos
# =============================================================================
# PROPÓSITO: Implementa el algoritmo de recomendación basado en contenido
# usando la base de datos de grafos Neo4j.
# FUNCIONA:
#   1. Se conecta a Neo4j
#   2. Consulta el historial de escuchas de un usuario
#   3. Encuentra canciones candidatas que comparten características (artista/género)
#     con las canciones que el usuario ya escuchó
#   4. Puntúa las candidatas según pesos: artista coincidente = 3 pts, género = 1 pt
#   5. Devuelve las top 10 canciones más relevantes
# ALGORITMO: Filtrado por Contenido con Ponderación de Pesos (Content-Based Filtering)
# REQUISITO: pip install neo4j
# =============================================================================

import os      # Módulo del sistema operativo
import sys     # Módulo del sistema para configuración de codificación

# Reconfigura stdout a UTF-8 para soportar emojis y caracteres especiales en Windows
sys.stdout.reconfigure(encoding='utf-8')

# Importa el driver oficial de Neo4j para Python
from neo4j import GraphDatabase

# ---- CLASE PRINCIPAL: Motor de Recomendaciones ----
class VibesRecommender:
    """
    Motor de recomendaciones musicales basado en grafos.
    Usa filtrado por contenido para encontrar canciones similares
    a las que el usuario ya ha escuchado, basándose en artistas y géneros compartidos.
    """
    
    def __init__(self, uri, user, password):
        """
        Constructor: Inicializa la conexión con la base de datos Neo4j.
        
        Parámetros:
            uri (str): URI del servidor Neo4j (ej: "neo4j+s://xxx.databases.neo4j.io")
            user (str): Nombre de usuario para autenticación
            password (str): Contraseña de autenticación
        """
        # Crea el driver de conexión que maneja un pool de conexiones reutilizables
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        """Cierra la conexión con la base de datos y libera los recursos del pool."""
        self.driver.close()

    def get_content_based_recommendations(self, id_usuario):
        """
        Algoritmo VIBES - Filtrado por Contenido con Ponderación de Pesos.
        
        Parámetros:
            id_usuario (str): Nombre del usuario para el cual generar recomendaciones
            
        Retorna:
            dict: Diccionario con:
                - "status": "Success" o "Cold Start"
                - "recomendaciones": Lista de dicts con "cancion" y "score"
                - "mensaje": Solo si status es "Cold Start"
        """
        # ---- CONSULTA CYPHER DE RECOMENDACIÓN ----
        # Esta consulta recorre el grafo para encontrar canciones similares
        query = """
        // PASO 1: Obtener el historial del usuario
        // Busca al usuario por nombre y sigue las relaciones ESCUCHA
        // para encontrar todas las canciones que ha escuchado
        MATCH (u:Usuario {nombre: $usuario})-[:ESCUCHA]->(escuchada:Cancion)
        
        // PASOS 2 y 3: Extraer características y buscar candidatas simultáneamente
        // Desde cada canción escuchada, sigue relaciones COMPUESTA_POR o PERTENECE_A
        // para llegar a las "características" (artistas y géneros)
        // Luego desde esas características, busca OTRAS canciones que compartan esas mismas
        // características -> esas son las candidatas a recomendación
        MATCH (escuchada)-[:COMPUESTA_POR|PERTENECE_A]->(caracteristica)<-[:COMPUESTA_POR|PERTENECE_A]-(candidata:Cancion)
        
        // PASO 4: Filtrar canciones que el usuario YA escuchó
        // NOT (u)-[:ESCUCHA]->(candidata) excluye canciones del historial
        WHERE NOT (u)-[:ESCUCHA]->(candidata)
        
        // SISTEMA DE PESOS: Pondera según el tipo de coincidencia
        // Decisión de diseño: Un artista compartido tiene MÁS peso que un género compartido
        // porque si te gusta un artista, es más probable que te gusten sus otras canciones
        WITH candidata, caracteristica,
          CASE 
            WHEN "Artista" IN labels(caracteristica) THEN 3 // Coincidir en ARTISTA = 3 puntos
            WHEN "Genero" IN labels(caracteristica) THEN 1  // Coincidir en GÉNERO = 1 punto
            ELSE 0                                           // Cualquier otro tipo = 0 puntos
          END AS peso
          
        // PASO 5: Sumar el puntaje total de cada candidata y ordenar
        // sum(peso) suma todos los puntos de coincidencia para cada canción
        RETURN candidata.titulo AS CancionRecomendada, sum(peso) AS PuntuacionRelevancia
        ORDER BY PuntuacionRelevancia DESC  // Las más relevantes primero
        LIMIT 10                            // Solo las top 10
        """

        # Ejecuta la consulta en la base de datos
        with self.driver.session() as session:
            result = session.run(query, usuario=id_usuario)  # Pasa el nombre del usuario como parámetro
            records = list(result)  # Convierte los resultados a una lista
            
            # ---- MANEJO DEL "COLD START" ----
            # Cold Start: problema común en sistemas de recomendación cuando un usuario es nuevo
            # y no tiene historial de escuchas. En ese caso, se devuelve un fallback.
            if not records:
                 return {"status": "Cold Start", "mensaje": "Usuario sin historial. Mostrando Top 50 Global (Fallback)."}
                 
            # Construye la lista de recomendaciones a partir de los resultados
            recomendaciones = []
            for record in records:
                recomendaciones.append({
                    "cancion": record["CancionRecomendada"],     # Título de la canción recomendada
                    "score": record["PuntuacionRelevancia"]       # Puntaje de relevancia
                })
                
            return {"status": "Success", "recomendaciones": recomendaciones}

# ==========================================
# Zona de Pruebas (Ejecución local)
# ==========================================
# Este bloque solo se ejecuta cuando el archivo se corre directamente
if __name__ == "__main__":
    print("🎵 Iniciando Motor de Recomendaciones VIBES...")
    
    # ---- CREDENCIALES DE CONEXIÓN A NEO4J ----
    URI = "neo4j+s://d544acc5.databases.neo4j.io"                         # URI del servidor Neo4j en la nube
    USER = "d544acc5"                                                       # Nombre de usuario
    PASSWORD = "3JdyXlKfIxftHD0U9-jMTni7_DWovV10M2TNscwVU1k"               # Contraseña
    
    try:
        # Crea una instancia del motor de recomendaciones
        app = VibesRecommender(URI, USER, PASSWORD)
        
        # Define el usuario de prueba
        usuario_prueba = "Marco Soloj"
        print(f"\n🔍 Buscando recomendaciones para: {usuario_prueba}...")
        
        # Ejecuta el algoritmo de recomendación
        resultados = app.get_content_based_recommendations(usuario_prueba)
        
        # Muestra los resultados formateados como JSON con indentación
        import json  # Importa json aquí porque solo se usa en modo de prueba
        print(json.dumps(resultados, indent=2, ensure_ascii=False))  # ensure_ascii=False para mostrar acentos
        
        # Cierra la conexión con la base de datos
        app.close()
    except Exception as e:
        # Manejo de errores con mensajes útiles
        print(f"\n❌ Error al conectar con Neo4j.")
        print("Asegúrate de que la base de datos esté iniciada y las credenciales sean correctas.")
        print(f"Detalle técnico: {e}")
