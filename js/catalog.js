// VIBES - Catálogo de Música Famosa en Español
// Este archivo define los géneros, artistas, moods y canciones famosas que se usan de forma híbrida en la aplicación.

const VIBES_CATALOG = {
    genres: [
        "Rock",
        "Pop",
        "Reggaetón",
        "Metal",
        "Hip Hop",
        "Electrónica",
        "Indie",
        "Baladas",
        "Jazz",
        "Clásica"
    ],
    artists: [
        {
            name: "Guns N' Roses",
            cover: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Linkin Park",
            cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Skillet",
            cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Daft Punk",
            cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "The Weeknd",
            cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Bad Bunny",
            cover: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Coldplay",
            cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Queen",
            cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Luis Miguel",
            cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Shakira",
            cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Rosalía",
            cover: "https://images.unsplash.com/photo-1484755560693-a4074577af3a?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Iron Maiden",
            cover: "https://images.unsplash.com/photo-1501612780327-4504d618702b?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Karol G",
            cover: "https://images.unsplash.com/photo-1524413840003-05174b1a7d73?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Drake",
            cover: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Taylor Swift",
            cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Billie Eilish",
            cover: "https://images.unsplash.com/photo-1550985543-f47f38aeee65?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Bruno Mars",
            cover: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Feid",
            cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Maroon 5",
            cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "AC/DC",
            cover: "https://images.unsplash.com/photo-1543536448-d209d2d13a1c?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Harry Styles",
            cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Eminem",
            cover: "https://images.unsplash.com/photo-1484755560693-a4074577af3a?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Dua Lipa",
            cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Travis Scott",
            cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Metallica",
            cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Adele",
            cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Arctic Monkeys",
            cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Tame Impala",
            cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Frank Sinatra",
            cover: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Claude Debussy",
            cover: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Ludwig van Beethoven",
            cover: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Kendrick Lamar",
            cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Alejandro Sanz",
            cover: "https://images.unsplash.com/photo-1501612780327-4504d618702b?q=80&w=400&auto=format&fit=crop"
        }
    ],
    moods: [
        {
            name: "Estudio",
            cover: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Ejercicio",
            cover: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Fiesta",
            cover: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Relajación",
            cover: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Melancolía",
            cover: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Enfoque",
            cover: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Euforia",
            cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop"
        },
        {
            name: "Nocturno",
            cover: "https://images.unsplash.com/photo-1484755560693-a4074577af3a?q=80&w=400&auto=format&fit=crop"
        }
    ],
    songs: [
        {
            title: "Sweet Child O' Mine",
            artist: "Guns N' Roses",
            genre: "Rock",
            mood: "Fiesta",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/a5/82/2d/a5822d67-2e65-fe95-511e-1f785d23e5cc/mzaf_8619467974951398014.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "She's got a smile that it seems to me",
                "Reminds me of childhood memories",
                "Where everything was as fresh as the bright blue sky",
                "Now and then when I see her face",
                "She takes me away to that special place",
                "And if I stared too long, I'd probably break down and cry"
            ],
            lyricsTranslated: [
                "Ella tiene una sonrisa que me parece",
                "Que me recuerda a memorias de mi infancia",
                "Donde todo era tan fresco como el cielo azul brillante",
                "De vez en cuando cuando veo su rostro",
                "Me lleva lejos a ese lugar especial",
                "Y si me quedara mirando mucho tiempo, probablemente lloraría"
            ]
        },
        {
            title: "In The End",
            artist: "Linkin Park",
            genre: "Rock",
            mood: "Enfoque",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/3f/cb/c7/3fcbc7cc-0606-7f6e-7fc3-793318cfd1ed/mzaf_16081918663584534594.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "It starts with one thing, I don't know why",
                "It doesn't even matter how hard you try",
                "Keep that in mind, I designed this rhyme",
                "To explain in due time all I know",
                "Time is a valuable thing",
                "Watch it fly by as the pendulum swings",
                "Watch it count down to the end of the day",
                "The clock ticks life away, it's so unreal"
            ],
            lyricsTranslated: [
                "Comienza con una cosa, no sé por qué",
                "Ni siquiera importa lo duro que lo intentes",
                "Ten eso en cuenta, diseñé esta rima",
                "Para explicar a su debido tiempo todo lo que sé",
                "El tiempo es algo sumamente valioso",
                "Míralo volar mientras el péndulo oscila",
                "Míralo contar en reversa hasta el fin del día",
                "El reloj descuenta la vida entera, es tan irreal"
            ]
        },
        {
            title: "Monster",
            artist: "Skillet",
            genre: "Metal",
            mood: "Ejercicio",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/95/27/83/952783ed-0199-a2f8-9f16-c8b27dec5673/mzaf_6017426365978589498.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "The secret side of me, I never let you see",
                "I keep it caged but I can't control it",
                "So stay away from me, the beast is ugly",
                "I feel the rage and I just can't hold it",
                "It's scratching on the walls, in the closet, in the halls",
                "It comes awake and I can't control it"
            ],
            lyricsTranslated: [
                "Mi lado secreto, el que nunca te dejo ver",
                "Lo mantengo enjaulado pero no puedo controlarlo",
                "Así que aléjate de mí, la bestia es horrible",
                "Siento la ira y simplemente no puedo contenerla",
                "Está arañando las paredes, en el clóset, en los pasillos",
                "Se despierta por completo y no logro controlarlo"
            ]
        },
        {
            title: "Get Lucky",
            artist: "Daft Punk",
            genre: "Electrónica",
            mood: "Fiesta",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/d4/d3/1e/d4d31eb4-7405-b806-8346-3c52ad5b4cf4/mzaf_8095545455942962509.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "Like the legend of the phoenix",
                "All ends with beginnings",
                "What keeps the planet spinning",
                "The force from the beginning",
                "We've come too far to give up who we are",
                "So let's raise the bar and our cups to the stars"
            ],
            lyricsTranslated: [
                "Como la leyenda del fénix",
                "Todo termina donde comienza",
                "Lo que mantiene al planeta girando",
                "Es la fuerza desde el principio",
                "Hemos llegado muy lejos para rendirnos",
                "Así que elevemos la barra y nuestras copas a las estrellas"
            ]
        },
        {
            title: "Blinding Lights",
            artist: "The Weeknd",
            genre: "Pop",
            mood: "Ejercicio",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/17/b4/8f/17b48f9a-0b93-6bb8-fe1d-3a16623c2cfb/mzaf_9560252727299052414.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "I've been on my own for long enough",
                "Maybe you can show me how to love, maybe",
                "I'm going through withdrawals",
                "You don't even have to do too much",
                "You can turn me on with just a touch, baby",
                "I look around and Sin City's cold and empty"
            ],
            lyricsTranslated: [
                "He estado solo por bastante tiempo",
                "Tal vez puedas enseñarme cómo amar, tal vez",
                "Estoy pasando por abstinencia",
                "Ni siquiera tienes que hacer demasiado",
                "Puedes encenderme con un solo toque, bebé",
                "Miro a mi alrededor y la ciudad del pecado está fría y vacía"
            ]
        },
        {
            title: "Ojitos Lindos",
            artist: "Bad Bunny",
            genre: "Reggaetón",
            mood: "Relajación",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/72/ae/81/72ae81c2-4ef3-b998-40b6-563c0609509f/mzaf_12868850384306577273.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "Hace mucho tiempo le hago caso al corazón",
                "Y pasan los días, los meses pensando en tu olor",
                "Ha llegado el tiempo para usar la razón",
                "Antes que sea tarde y sin querer me parta en dos",
                "Y solo mírame con esos ojitos lindos",
                "Que con eso yo estoy bien",
                "Hace tiempo que no agarro a nadie de la mano",
                "Hace tiempo que no envío 'buenos días, te amo'",
                "Pero tú me tienes enredado",
                "Como si esto fuera un juego y yo ya he ganado"
            ],
            lyricsTranslated: [
                "I've been following my heart for a long time",
                "And the days and months go by, thinking about your scent",
                "The time has arrived to use reason",
                "Before it's too late and I end up breaking in two without meaning to",
                "And just look at me with those cute little eyes",
                "That's enough for me to be fine",
                "It's been a while since I've held anyone's hand",
                "It's been a while since I've sent a 'good morning, I love you'",
                "But you have me all tangled up",
                "As if this were a game and I've already won"
            ]
        },
        {
            title: "Viva La Vida",
            artist: "Coldplay",
            genre: "Pop",
            mood: "Estudio",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/2b/04/65/2b0465c3-2db1-e461-2362-14b528456b8f/mzaf_1805426141027060154.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "I used to rule the world",
                "Seas would rise when I gave the word",
                "Now in the morning I sleep alone",
                "Sweep the streets I used to own",
                "I used to roll the dice",
                "Feel the fear in my enemy's eyes"
            ],
            lyricsTranslated: [
                "Yo solía gobernar el mundo",
                "Los mares se abrían al dar mi palabra",
                "Ahora por las mañanas duermo solo",
                "Barro las calles que solían ser mías",
                "Solía lanzar los dados del destino",
                "Sentir el miedo en los ojos de mis enemigos"
            ]
        },
        {
            title: "Bohemian Rhapsody",
            artist: "Queen",
            genre: "Rock",
            mood: "Euforia",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/8f/11/52/8f1152a9-fd5f-0021-f546-b97579c22ec3/mzaf_3962258993076347789.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "Is this the real life? Is this just fantasy?",
                "Caught in a landslide, no escape from reality",
                "Open your eyes, look up to the skies and see",
                "I'm just a poor boy, I need no sympathy",
                "Because I'm easy come, easy go, little high, little low",
                "Any way the wind blows doesn't really matter to me"
            ],
            lyricsTranslated: [
                "¿Es esta la vida real? ¿O es solo fantasía?",
                "Atrapado en un derrumbe, sin escape de la realidad",
                "Abre tus ojos, mira hacia los cielos y observa",
                "Solo soy un pobre chico, no necesito compasión",
                "Porque fácil vengo, fácil me voy, un poco alto, un poco bajo",
                "Cualquier dirección que tome el viento no me importa realmente"
            ]
        },
        {
            title: "One More Time",
            artist: "Daft Punk",
            genre: "Electrónica",
            mood: "Nocturno",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/98/96/f6/9896f638-8b47-3f76-c47e-19e43b53677c/mzaf_15900001332254520801.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "One more time, we're gonna celebrate",
                "Oh yeah, alright, don't stop the dancing",
                "One more time, I'm gonna feel the vibe",
                "Celebrate and dance so free",
                "Music's got me feeling so free",
                "We're gonna celebrate once more"
            ],
            lyricsTranslated: [
                "Una vez más, vamos a celebrar",
                "Oh sí, está bien, no pares el baile",
                "Una vez más, voy a sentir la vibra",
                "Celebrar y bailar tan libremente",
                "La música me hace sentir tan libre",
                "Vamos a celebrar una vez más"
            ]
        },
        {
            title: "Tusa",
            artist: "Karol G",
            genre: "Reggaetón",
            mood: "Fiesta",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/fd/14/d0/fd14d026-64d8-c68e-0fbf-b30f35368a52/mzaf_17078330752495393144.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1524413840003-05174b1a7d73?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "Ya no tiene excusa, hoy salió con su amiga",
                "Dizque para matar la tusa que porque un hombre le pagó mal",
                "Está dura y abusa, se cansó de ser buena",
                "Ahora es ella la que se divierte sin pena",
                "Y canta la canción con todo el sentimiento",
                "Llorando por él en el apartamento"
            ],
            lyricsTranslated: [
                "Ya no tiene excusa, hoy salió con su amiga",
                "Dizque para matar la tusa que porque un hombre le pagó mal",
                "Está dura y abusa, se cansó de ser buena",
                "Ahora es ella la que se divierte sin pena",
                "Y canta la canción con todo el sentimiento",
                "Llorando por él en el apartamento"
            ]
        },
        {
            title: "Hotline Bling",
            artist: "Drake",
            genre: "Hip Hop",
            mood: "Nocturno",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/c7/b1/f3/c7b1f35a-8d24-735b-5923-1fb52fc7647e/mzaf_12441003627825640809.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "You used to call me on my cell phone",
                "Late night when you need my love",
                "Call me on my cell phone",
                "Late night when you need my love",
                "I know when that hotline bling",
                "That can only mean one thing"
            ],
            lyricsTranslated: [
                "Solías llamarme a mi teléfono celular",
                "Tarde en la noche cuando necesitabas mi amor",
                "Llamarme a mi teléfono celular",
                "Tarde en la noche cuando necesitabas mi amor",
                "Sé que cuando esa línea brilla",
                "Solo puede significar una sola cosa"
            ]
        },
        {
            title: "Shake It Off",
            artist: "Taylor Swift",
            genre: "Pop",
            mood: "Euforia",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/11/d5/6d/11d56d4a-ce23-e793-8681-70dc4d35d931/mzaf_5886436202259848624.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "I stay out too late, got nothing in my brain",
                "That's what people say, mmm-mmm",
                "I go on too many dates, but I can't make them stay",
                "At least that's what people say, mmm-mmm",
                "But I keep cruising, can't stop, won't stop moving",
                "It's like I got this music in my mind saying it's gonna be alright"
            ],
            lyricsTranslated: [
                "Me quedo fuera hasta tarde, no tengo nada en el cerebro",
                "Eso es lo que la gente dice, mmm-mmm",
                "Salgo en demasiadas citas, pero no logro que se queden",
                "Al menos eso es lo que la gente dice, mmm-mmm",
                "Pero yo sigo navegando, no puedo parar, no pararé de moverme",
                "Es como si tuviera esta música en mi mente diciendo que todo estará bien"
            ]
        },
        {
            title: "Bad Guy",
            artist: "Billie Eilish",
            genre: "Pop",
            mood: "Melancolía",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/c3/87/1f/c3871f7e-3260-d615-1c66-5fdca2c3a48f/mzaf_10721331211699880949.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1550985543-f47f38aeee65?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "White shirt now red, my bloody nose",
                "Sleepin', you're on your tippy toes",
                "Creepin' around like no one knows",
                "Think you're so criminal",
                "Bruises on both my knees for you",
                "Don't say thank you or please"
            ],
            lyricsTranslated: [
                "Camisa blanca ahora roja, mi nariz sangrando",
                "Durmiendo, estás de puntillas",
                "Deslizándote como si nadie lo supiera",
                "Crees que eres tan criminal",
                "Moretones en ambas rodillas por ti",
                "No digas gracias ni por favor"
            ]
        },
        {
            title: "Uptown Funk",
            artist: "Bruno Mars",
            genre: "Pop",
            mood: "Fiesta",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/62/e1/98/62e19826-cd13-6eff-390e-dbca502bb7b5/mzaf_8006535252627949661.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "This hit, that ice cold, Michelle Pfeiffer, that white gold",
                "This one for them hood girls, them good girls, straight masterpieces",
                "Stylin', wilin', livin' it up in the city",
                "Got Chucks on with Saint Laurent",
                "Gotta kiss myself, I'm so pretty",
                "Too hot (hot damn), called a police and a fireman"
            ],
            lyricsTranslated: [
                "Este éxito, ese hielo frío, Michelle Pfeiffer, oro blanco",
                "Esta es para las chicas del barrio, las chicas buenas, obras de arte",
                "Con estilo, salvajes, viviendo a lo grande en la ciudad",
                "Llevo puestos mis Chucks con Saint Laurent",
                "Tengo que besarme a mí mismo, soy tan guapo",
                "Demasiado caliente (rayos), llama a la policía y al bombero"
            ]
        },
        {
            title: "Classy 101",
            artist: "Feid",
            genre: "Reggaetón",
            mood: "Nocturno",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/9c/d2/4d/9cd24d66-c419-ba61-8563-598685e1cec1/mzaf_14881369885675595919.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "Ella es elegante, una classy cien de cien",
                "Se viste de negro y le queda muy bien",
                "Fumando en la disco con una copa de gin",
                "Bailando reggaetón hasta que llegue el fin",
                "Dime si te vienes conmigo esta noche",
                "Nos escapamos lejos y quemamos el coche"
            ],
            lyricsTranslated: [
                "Ella es elegante, una classy cien de cien",
                "Se viste de negro y le queda muy bien",
                "Fumando en la disco con una copa de gin",
                "Bailando reggaetón hasta que llegue el fin",
                "Dime si te vienes conmigo esta noche",
                "Nos escapamos lejos y quemamos el coche"
            ]
        },
        {
            title: "Sugar",
            artist: "Maroon 5",
            genre: "Pop",
            mood: "Fiesta",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/1b/3f/68/1b3f68e0-3c42-f367-cd0f-e46c746e0668/mzaf_15052021441666328650.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "I'm hurting, baby, I'm broken down",
                "I need your loving, loving, I need it now",
                "When I'm without you, I'm something weak",
                "You got me begging, begging, I'm on my knees",
                "I don't wanna be needing your love",
                "I just wanna be deep in your love"
            ],
            lyricsTranslated: [
                "Me duele, bebé, estoy destrozado",
                "Necesito tu amor, amor, lo necesito ahora",
                "Cuando estoy sin ti, soy muy débil",
                "Me tienes rogando, rogando de rodillas",
                "No quiero estar necesitando tu amor",
                "Solo quiero estar sumergido en tu amor"
            ]
        },
        {
            title: "Back in Black",
            artist: "AC/DC",
            genre: "Rock",
            mood: "Ejercicio",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/b5/14/aa/b514aa08-4772-93db-c69f-420fbe0bb24c/mzaf_17779796508174317776.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1543536448-d209d2d13a1c?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "Back in black, I hit the sack",
                "I've been too long, I'm glad to be back",
                "Yes, I'm let loose from the noose",
                "That's kept me hanging about",
                "I'm keeping my eyes on the road",
                "And nobody's gonna get me on another ride"
            ],
            lyricsTranslated: [
                "De vuelta en negro, caigo en la cama",
                "He estado fuera demasiado tiempo, me alegra volver",
                "Sí, me he soltado de la soga",
                "Que me mantenía colgado",
                "Mantengo mis ojos fijos en la carretera",
                "Y nadie va a atraparme en otro viaje"
            ]
        },
        {
            title: "As It Was",
            artist: "Harry Styles",
            genre: "Pop",
            mood: "Relajación",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/67/10/16/67101606-3869-ca44-6c03-e13d6322cb51/mzaf_1135399237022217274.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "Holdin' me back, gravity's holdin' me back",
                "I want you to hold out the palm of your hand",
                "Why don't we leave it at that?",
                "Nothin' to say, when everything gets in the way",
                "Seems you cannot be replaced",
                "And I'm the one who will stay, oh"
            ],
            lyricsTranslated: [
                "Frenándome, la gravedad me está frenando",
                "Quiero que extiendas la palma de tu mano",
                "¿Por qué no lo dejamos así?",
                "Nada que decir, cuando todo se interpone en el camino",
                "Parece que no puedes ser reemplazada",
                "Y yo soy el único que se quedará, oh"
            ]
        },
        {
            title: "Lose Yourself",
            artist: "Eminem",
            genre: "Hip Hop",
            mood: "Ejercicio",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/62/0a/a5/620aa56f-189e-708a-80f0-cebdada3872e/mzaf_7131619873177773332.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1484755560693-a4074577af3a?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "Look, if you had one shot, or one opportunity",
                "To seize everything you ever wanted in one moment",
                "Would you capture it, or just let it slip?",
                "His palms are sweaty, knees weak, arms are heavy",
                "There's vomit on his sweater already, mom's spaghetti",
                "He's nervous, but on the surface he looks calm and ready"
            ],
            lyricsTranslated: [
                "Mira, si tuvieras un disparo, o una sola oportunidad",
                "De atrapar todo lo que siempre quisiste en un momento",
                "¿Lo capturarías, o simplemente lo dejarías escapar?",
                "Sus palmas están sudadas, rodillas débiles, brazos pesados",
                "Ya hay vómito en su suéter, el espagueti de mamá",
                "Está nervioso, pero en la superficie parece tranquilo y listo"
            ]
        },
        {
            title: "Levitating",
            artist: "Dua Lipa",
            genre: "Pop",
            mood: "Fiesta",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/59/dc/4d/59dc4dda-93ff-8f1c-c536-f005f6ea6af5/mzaf_3066686759813252385.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "If you wanna run away with me, I know a galaxy",
                "And I can take you for a ride",
                "I had a premonition that we fell into a rhythm",
                "Where the music don't stop for life",
                "Glitter in the sky, glitter in my eyes",
                "Shining just the way I like"
            ],
            lyricsTranslated: [
                "Si quieres huir conmigo, conozco una galaxia",
                "Y puedo llevarte a dar un paseo",
                "Tuve una premonición de que caímos en un ritmo",
                "Donde la música nunca se detiene",
                "Brillo en el cielo, brillo en mis ojos",
                "Brillando justo de la forma que me gusta"
            ]
        },
        {
            title: "Sicko Mode",
            artist: "Travis Scott",
            genre: "Hip Hop",
            mood: "Euforia",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/85/49/e2/8549e207-7ecf-21a9-7b2f-b414175c6a74/mzaf_10189975321658500285.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "Astro, yeah, sun is down, freezing cold",
                "That's how we already know winter's here",
                "My dawg would probably do it for a Louis belt",
                "That's all he know, he don't know nothin' else",
                "I tried to show 'em, yeah, yeah",
                "Gone on you with the pick and roll, young La Flame"
            ],
            lyricsTranslated: [
                "Astro, sí, el sol se oculta, frío helado",
                "Así es como sabemos que el invierno está aquí",
                "Mi colega probablemente lo haría por un cinturón Louis",
                "Eso es todo lo que sabe, no sabe nada más",
                "Traté de enseñárselo, sí, sí",
                "Me fui de ti con la jugada maestra, joven La Flame"
            ]
        },
        {
            title: "Enter Sandman",
            artist: "Metallica",
            genre: "Metal",
            mood: "Ejercicio",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/85/a5/65/85a565a5-c992-0a77-a1be-c4b190c7f395/mzaf_12174803259665081383.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "Say your prayers, little one, don't forget, my son",
                "To include everyone",
                "Tuck you in, warm within, keep you free from sin",
                "Till the Sandman he comes",
                "Sleep with one eye open, gripping your pillow tight",
                "Exit light, enter night, take my hand"
            ],
            lyricsTranslated: [
                "Di tus oraciones, pequeño, no olvides, mi hijo",
                "Incluir a todo el mundo",
                "Arropado, cálido por dentro, libre de pecado",
                "Hasta que venga el Hombre de la Arena",
                "Duerme con un ojo abierto, apretando tu almohada",
                "Sale la luz, entra la noche, toma mi mano"
            ]
        },
        {
            title: "Hello",
            artist: "Adele",
            genre: "Baladas",
            mood: "Melancolía",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/93/22/22/93222271-8d55-d923-e0ff-b2964a5abefe/mzaf_3513742103157153222.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "Hello, it's me",
                "I was wondering if after all these years you'd like to meet",
                "To go over everything",
                "They say that time's supposed to heal ya",
                "But I ain't done much healing",
                "Hello, can you hear me?"
            ],
            lyricsTranslated: [
                "Hola, soy yo",
                "Me preguntaba si después de todos estos años querrías vernos",
                "Para repasar todo lo que pasó",
                "Dicen que el tiempo se supone que te cura",
                "Pero yo no me he curado mucho",
                "Hola, ¿puedes escucharme?"
            ]
        },
        {
            title: "Master of Puppets",
            artist: "Metallica",
            genre: "Metal",
            mood: "Euforia",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/da/e7/9c/dae79c08-a960-2d21-8eab-42e9d70e29e6/mzaf_7135498142102205621.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "End of passion play, crumbling away",
                "I'm your source of self-destruction",
                "Veins that pump with fear, sucking darkest clear",
                "Leading on your deaths' construction",
                "Taste me and you will see, more is all you need",
                "Dedicated to how I'm killing you"
            ],
            lyricsTranslated: [
                "Fin del juego de pasión, desmoronándose",
                "Soy tu fuente de autodestrucción",
                "Venas que bombean con miedo, succionando la oscuridad",
                "Guiando la construcción de tu muerte",
                "Pruébame y verás, más es todo lo que necesitas",
                "Dedicado a cómo te estoy matando"
            ]
        },
        {
            title: "Hells Bells",
            artist: "AC/DC",
            genre: "Rock",
            mood: "Nocturno",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/3b/1d/6f/3b1d6fc6-fe3e-b0a0-ff8c-0e0d357097c5/mzaf_18386295871643717119.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1543536448-d209d2d13a1c?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "I'm rolling thunder, pouring rain",
                "I'm coming on like a hurricane",
                "My lightning's flashing across the sky",
                "You're only young but you're gonna die",
                "I won't take no prisoners, won't spare no lives",
                "Nobody's putting up a fight"
            ],
            lyricsTranslated: [
                "Soy un trueno retumbante, una lluvia torrencial",
                "Vengo con la fuerza de un huracán",
                "Mis relámpagos brillan por todo el cielo",
                "Eres muy joven pero vas a morir",
                "No tomaré prisioneros, no perdonaré vidas",
                "Nadie va a oponer resistencia"
            ]
        },
        {
            title: "Somebody To Love",
            artist: "Queen",
            genre: "Rock",
            mood: "Estudio",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/0e/07/3a/0e073a5c-bf2b-cab0-c914-d36dea8169f1/mzaf_16606363410381177407.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "Can anybody find me somebody to love?",
                "Each morning I get up I die a little",
                "Can barely stand on my feet",
                "Take a look in the mirror and cry",
                "Lord, what you're doing to me?",
                "I have spent all my years in believing you"
            ],
            lyricsTranslated: [
                "¿Puede alguien encontrarme alguien a quien amar?",
                "Cada mañana me levanto y muero un poco",
                "Apenas puedo sostenerme en pie",
                "Miro en el espejo y lloro",
                "Señor, ¿qué me estás haciendo?",
                "He pasado todos mis años creyendo en ti"
            ]
        },
        {
            title: "Save Your Tears",
            artist: "The Weeknd",
            genre: "Pop",
            mood: "Relajación",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/8b/38/17/8b3817e4-c0e9-7e02-2654-3e2ecee93603/mzaf_18415642125637540903.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "Ooh, yeah, I saw you dancing in a crowded room",
                "You look so happy when I'm not with you",
                "But then you saw me, caught you by surprise",
                "A single teardrop falling from your eye",
                "I don't know why I run away",
                "I make you cry when I run away"
            ],
            lyricsTranslated: [
                "Ooh, sí, te vi bailando en una sala llena",
                "Te ves tan feliz cuando no estoy contigo",
                "Pero luego me viste, te tomé por sorpresa",
                "Una sola lágrima cayendo de tu ojo",
                "No sé por qué huyo",
                "Te hago llorar cuando salgo corriendo"
            ]
        },
        {
            title: "Starboy",
            artist: "The Weeknd",
            genre: "Pop",
            mood: "Enfoque",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/3f/a0/ba/3fa0ba5b-088d-bcf2-e4bd-355a5d505617/mzaf_3355567893400963384.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "I'm tryna put you in the worst mood, ah",
                "P1 cleaner than your church shoes, ah",
                "Milli point two just to hurt you, ah",
                "House so empty, need a centerpiece",
                "Twenty racks a table cut from ebony",
                "Cut that trophy girls, now she elegant"
            ],
            lyricsTranslated: [
                "Intento ponerte en el peor humor, ah",
                "El P1 está más limpio que tus zapatos de iglesia, ah",
                "Un millón punto dos solo para lastimarte, ah",
                "Casa tan vacía, necesito una pieza central",
                "Mesa de veinte mil tallada en ébano",
                "Corta esa chica trofeo, ahora es elegante"
            ]
        },
        {
            title: "Ghost in the Stack",
            artist: "Daft Punk",
            genre: "Electrónica",
            mood: "Enfoque",
            file: "audio/ghost_in_the_stack.mp3",
            cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop",
            lyrics: [],
            lyricsTranslated: []
        },
        {
            title: "Neon Protocol",
            artist: "Daft Punk",
            genre: "Electrónica",
            mood: "Nocturno",
            file: "audio/neon_protocol.mp3",
            cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop",
            lyrics: [],
            lyricsTranslated: []
        },
        {
            title: "Pulse Architecture",
            artist: "Skillet",
            genre: "Metal",
            mood: "Estudio",
            file: "audio/pulse_architecture.mp3",
            cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop",
            lyrics: [],
            lyricsTranslated: []
        },
        {
            title: "Signal Drift",
            artist: "Linkin Park",
            genre: "Rock",
            mood: "Relajación",
            file: "audio/signal_drift.mp3",
            cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=400&auto=format&fit=crop",
            lyrics: [],
            lyricsTranslated: []
        },
        {
            title: "Synaptic Echoes",
            artist: "Coldplay",
            genre: "Pop",
            mood: "Enfoque",
            file: "audio/synaptic_echoes.mp3",
            cover: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=400&auto=format&fit=crop",
            lyrics: [],
            lyricsTranslated: []
        },
        {
            title: "Do I Wanna Know?",
            artist: "Arctic Monkeys",
            genre: "Indie",
            mood: "Nocturno",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview123/v4/df/c3/9c/dfc39caa-a559-b5ac-5b50-472a1c300ca6/mzaf_14741548917211029550.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "Have you got colour in your cheeks?",
                "Do you ever get that fear that you can't shift the tide?",
                "That sticks around like something's in your teeth?",
                "Are there some aces up your sleeve?",
                "Have you no idea that you're in deep?",
                "I dreamt about you nearly every night this week"
            ],
            lyricsTranslated: [
                "¿Tienes color en tus mejillas?",
                "¿Alguna vez sientes ese miedo de no poder cambiar la marea?",
                "¿Que se queda allí como algo entre tus dientes?",
                "¿Tienes algunos ases bajo la manga?",
                "¿No tienes idea de que estás muy involucrado?",
                "Soñé contigo casi todas las noches de esta semana"
            ]
        },
        {
            title: "The Less I Know The Better",
            artist: "Tame Impala",
            genre: "Indie",
            mood: "Relajación",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/8b/55/f3/8b55f3a3-3204-8930-f156-82843546950e/mzaf_9370328603131228430.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "Someone said they left together",
                "I ran out the door to get her",
                "She was holding hands with Trevor",
                "Not the greatest feeling ever",
                "Said, 'Pull yourself together'",
                "Darling, I'm pretty sure you're doing fine"
            ],
            lyricsTranslated: [
                "Alguien dijo que se fueron juntos",
                "Salí corriendo para buscarla",
                "Ella estaba tomada de la mano con Trevor",
                "No es el mejor sentimiento de la vida",
                "Dije: 'Tranquilízate'",
                "Cariño, estoy bastante seguro de que te va muy bien"
            ]
        },
        {
            title: "Fly Me To The Moon",
            artist: "Frank Sinatra",
            genre: "Jazz",
            mood: "Nocturno",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/d2/20/75/d22075e3-b9f6-7337-5aab-a0f21a036562/mzaf_8055883631088518579.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "Fly me to the moon",
                "Let me play among the stars",
                "Let me see what spring is like",
                "On a, Jupiter and Mars",
                "In other words, hold my hand",
                "In other words, baby, kiss me"
            ],
            lyricsTranslated: [
                "Llévame volando a la luna",
                "Déjame jugar entre las estrellas",
                "Déjame ver cómo es la primavera",
                "En Júpiter y Marte",
                "En otras palabras, toma mi mano",
                "En otras palabras, cariño, bésame"
            ]
        },
        {
            title: "Clair de Lune",
            artist: "Claude Debussy",
            genre: "Clásica",
            mood: "Relajación",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/c3/68/35/c36835b6-9cb3-a20a-088b-6c7d39e39636/mzaf_484141242926915999.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?q=80&w=400&auto=format&fit=crop",
            lyrics: [],
            lyricsTranslated: []
        },
        {
            title: "Symphony No. 5",
            artist: "Ludwig van Beethoven",
            genre: "Clásica",
            mood: "Enfoque",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/56/fb/84/56fb8426-db22-9b4a-4bec-bc5585d1f53e/mzaf_2983095940829206081.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=400&auto=format&fit=crop",
            lyrics: [],
            lyricsTranslated: []
        },
        {
            title: "HUMBLE.",
            artist: "Kendrick Lamar",
            genre: "Hip Hop",
            mood: "Euforia",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/30/3f/27/303f27c8-1997-8c57-66b3-b67e7c720779/mzaf_5598476068977070849.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "Nobody pray for me",
                "It been that way for a minute now",
                "Ay, I remember syrup sandwiches and crime allowances",
                "Finesse a nigga with some counterfeits",
                "But now I'm counting this",
                "Be humble, sit down"
            ],
            lyricsTranslated: [
                "Nadie reza por mí",
                "Ha sido así por un buen rato ya",
                "Ay, recuerdo los sándwiches de jarabe y los presupuestos del crimen",
                "Sorprender a alguien con billetes falsificados",
                "Pero ahora estoy contando esto",
                "Sé humilde, siéntate"
            ]
        },
        {
            title: "Sabor A Mí",
            artist: "Luis Miguel",
            genre: "Baladas",
            mood: "Relajación",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/ae/81/b9/ae81b929-fb45-a034-0454-4f9734f07c76/mzaf_4369566600690405721.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "Tanto tiempo disfrutamos de este amor",
                "Nuestras almas se acercaron tanto así",
                "Que yo guardo tu sabor",
                "Pero tú llevas también, sabor a mí",
                "Si negaras mi presencia en tu vivir",
                "Bastaría con abrazarte y conversar"
            ],
            lyricsTranslated: [
                "Tanto tiempo disfrutamos de este amor",
                "Nuestras almas se acercaron tanto así",
                "Que yo guardo tu sabor",
                "Pero tú llevas también, sabor a mí",
                "Si negaras mi presencia en tu vivir",
                "Bastaría con abrazarte y conversar"
            ]
        },
        {
            title: "Corazón Partío",
            artist: "Alejandro Sanz",
            genre: "Baladas",
            mood: "Melancolía",
            file: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview116/v4/11/8a/b5/118ab52d-7f9c-6821-3222-334583347ee7/mzaf_7063687902650814927.plus.aac.p.m4a",
            cover: "https://images.unsplash.com/photo-1501612780327-4504d618702b?q=80&w=400&auto=format&fit=crop",
            lyrics: [
                "Tantas promesas que se van con el viento",
                "Tantos recuerdos que se quedan adentro",
                "¿Y quién me va a entregar sus emociones?",
                "Quién me va a pedir que nunca le abandone?",
                "¿Quién me tapará esta noche si hace frío?",
                "¿Y quién me va a curar el corazón partío?"
            ],
            lyricsTranslated: [
                "Tantas promesas que se van con el viento",
                "Tantos recuerdos que se quedan adentro",
                "¿Y quién me va a entregar sus emociones?",
                "Quién me va a pedir que nunca le abandone?",
                "¿Quién me tapará esta noche si hace frío?",
                "¿Y quién me va a curar el corazón partío?"
            ]
        }
    ]
};

// Exportar para Node.js (backend) si es necesario, o dejarlo global para navegador
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
    module.exports = VIBES_CATALOG;
} else {
    window.VIBES_CATALOG = VIBES_CATALOG;
}
