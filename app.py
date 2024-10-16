from flask import Flask, request, jsonify, render_template
import openai
import os

app = Flask(__name__)

# Configura tu clave API de OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

# Ruta principal para servir la página HTML
@app.route('/')
def home():
    return render_template('index.html')

# Coordenadas predefinidas de las banderas de los 18 hoyos
hoyos = {
    "hoyo_1": {"lat": 41.6187512, "long": -4.8079327},
    "hoyo_2": {"lat": 41.6186301, "long": -4.8065528},
    "hoyo_3": {"lat": 41.6180942, "long": -4.8090874},
    "hoyo_4": {"lat": 41.6179133, "long": -4.8070946},
    "hoyo_5": {"lat": 41.6190798, "long": -4.8080887},
    "hoyo_6": {"lat": 41.6181958, "long": -4.8060854},
    "hoyo_7": {"lat": 41.6168229, "long": -4.8068491},
    "hoyo_8": {"lat": 41.6171959, "long": -4.8080427},
    "hoyo_9": {"lat": 41.6178890, "long": -4.8096769}
}

# Función simplificada para calcular distancia entre dos puntos (en metros)
def calcular_distancia(lat1, lon1, lat2, lon2):
    from geopy.distance import geodesic
    coordenadas1 = (lat1, lon1)
    coordenadas2 = (lat2, lon2)
    return geodesic(coordenadas1, coordenadas2).meters

# Nueva función para generar consejos con GPT-4o-mini
def generar_consejo(distancia, hoyo, comentarios_adicionales):
    try:
        # Solicitud a la API GPT-4o-mini para generar un consejo
        response = client.chat.completions.create(
  model="gpt-4o-mini",
  messages=[
    {
      "role": "system",
      "content": [
        {
          "type": "text",
          "text": "Soy un asistente para un jugador de golf. Actualmente, el jugador está a {distancia:.2f} metros del hoyo {hoyo}. {comentarios_adicionales} ¿Puedes darle algunos consejos sobre cómo acercarse a la bandera en base a esta distancia?"
        }
      ]
    }
  ],
  temperature=1,
  max_tokens=2048,
  top_p=1,
  frequency_penalty=0,
  presence_penalty=0,
  response_format={
    "type": "text"
  }
)
        
        # Obtener el contenido del mensaje
        mensaje = response['choices'][0]['message']['content'].strip()
        return mensaje

    except Exception as e:
        return f"Error generando consejo: {str(e)}"

# Ruta para calcular la distancia y obtener el consejo
@app.route('/calcular_distancia', methods=['POST'])
def calcular_distancia_endpoint():
    try:
        data = request.get_json()
        lat = data.get('lat')
        lon = data.get('lon')
        hoyo = data.get('hoyo')
        comentarios_adicionales = data.get('comentarios', '')  # Comentarios adicionales del jugador sobre bunkers, viento, etc.

        if hoyo not in hoyos:
            return jsonify({"error": "Hoyo no encontrado"}), 404

        distancia = calcular_distancia(lat, lon, hoyos[hoyo]['lat'], hoyos[hoyo]['long'])
        
        # Generar un consejo usando GPT-4o-mini
        consejo = generar_consejo(distancia, hoyo, comentarios_adicionales)

        return jsonify({"distancia": distancia, "consejo": consejo})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)