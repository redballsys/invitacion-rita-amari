import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, animate } from "framer-motion";
import { Calendar, MapPin, Music2, VolumeX } from "lucide-react";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function getTimeLeft(targetDate) {
  const now = new Date().getTime();
  const target = targetDate.getTime();
  const diff = Math.max(0, target - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { diff, days, hours, minutes, seconds };
}

// Animaciones (cuento)
const storyContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0.15 },
  },
};

const storyLine = {
  hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: "easeOut" },
  },
};

export default function InvitacionRitaAmari() {
  // Datos del evento
  const nombre = "Rita Amari";
  const fechaTexto = "Sábado 21 de febrero";
  const horaTexto = "4:00 PM";

  const direccionLineas = [
    "2da de Netzahualcóyotl N. 119",
    "Col. Barrio Choco",
    "Miahuatlán de Porfirio Díaz",
  ];

  const mapsUrl = "https://maps.app.goo.gl/P6mUutWW4daAx45Q9";

  // Fecha (2026)
  const targetDate = useMemo(() => new Date("2026-02-21T16:00:00-06:00"), []);

  // Contador
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetDate));
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  // Audio
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // muted por defecto para permitir autoplay
  const [hasInteracted, setHasInteracted] = useState(false);

  // A) Intentar autoplay al cargar (en MUTE)
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    a.loop = true;
    a.muted = true;
    setIsMuted(true);

    const tryPlay = async () => {
      try {
        await a.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    };

    tryPlay();
  }, []);

  // B) Primer toque/click: habilitar reproducción (sin forzar unmute)
  useEffect(() => {
    const enableSound = async () => {
      const a = audioRef.current;
      if (!a) return;

      setHasInteracted(true);

      try {
        // respeta el estado actual de mute
        a.muted = isMuted;
        await a.play();
        setIsPlaying(true);
      } catch {
        // si sigue bloqueado, no hacemos nada
      }
    };

    window.addEventListener("touchstart", enableSound, { once: true });
    window.addEventListener("click", enableSound, { once: true });

    return () => {
      window.removeEventListener("touchstart", enableSound);
      window.removeEventListener("click", enableSound);
    };
  }, [isMuted]);

  // C) Pausar al irse y reanudar al volver (solo si ya hubo interacción)
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const onVisibilityChange = () => {
      if (document.hidden) {
        a.pause();
        setIsPlaying(false);
        return;
      }

      if (hasInteracted) {
        a.muted = isMuted; // mantener sincronizado
        a.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    };

    const onPageHide = () => {
      a.pause();
      setIsPlaying(false);
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [hasInteracted, isMuted]);

  const toggleMute = async () => {
    const a = audioRef.current;
    if (!a) return;

    const nextMuted = !a.muted;
    a.muted = nextMuted;
    setIsMuted(nextMuted);

    // Si el usuario desmutea y el audio estaba pausado, intenta reproducir
    if (!nextMuted) {
      try {
        await a.play();
        setIsPlaying(true);
      } catch {}
    }
  };

  // Shimmer (lo dejas si luego lo vuelves a usar)
  const shimmerX = useMotionValue(-120);

  useEffect(() => {
    const controls = animate(shimmerX, 120, {
      duration: 2.6,
      repeat: Infinity,
      repeatType: "loop",
      ease: "easeInOut",
    });

    return controls.stop;
  }, [shimmerX]);

  const shimmerBg = useMotionTemplate`
    linear-gradient(
      120deg,
      rgba(122,20,51,0) 0%,
      rgba(255,255,255,0.85) 20%,
      rgba(122,20,51,0) 40%
    )
  `;

  return (
    <div className="relative w-full min-h-[100svh] overflow-x-hidden bg-[#07162f]">
      {/* Fondo fijo detrás (sin márgenes negros) */}
      <img
        src="/images/frame-bella.png"
        alt=""
        className="fixed inset-0 w-full h-full object-cover object-center"
        aria-hidden="true"
      />

      {/* Capa ligera para legibilidad */}
      <div className="fixed inset-0 bg-black/10" aria-hidden="true" />

      {/* Contenido scrolleable */}
      <div className="relative z-10 w-full flex justify-center px-3 py-6">
        <div className="w-full max-w-[430px]">
          {/* Audio */}
          <audio ref={audioRef} src="/audio/bella-y-bestia.mp3" loop preload="auto" playsInline />

          {/* Botón flotante mute/unmute */}
          <button
            onClick={toggleMute}
            aria-label={isMuted ? "Activar sonido" : "Silenciar música"}
            className="fixed bottom-5 right-5 z-50 rounded-full shadow-lg text-white p-3 active:scale-95 focus:outline-none"
            style={{ backgroundColor: "#0B1B3A" }}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Music2 className="w-5 h-5" />}
          </button>

          {/* Tarjeta con marco visible completo (contain) */}
          <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl min-h-[860px]">
            {/* Relleno detrás para evitar negros si sobra espacio */}
            <div className="absolute inset-0 bg-[#07162f]" aria-hidden="true" />

            {/* Marco completo */}
            <img
              src="/images/frame-bella.png"
              alt=""
              className="absolute inset-0 w-full h-full object-contain object-center"
              aria-hidden="true"
            />

            {/* Overlay suave */}
            <div className="absolute inset-0 bg-black/10" aria-hidden="true" />

            {/* Contenido */}
            <div className="relative z-10 px-6 pt-10 pb-8">
              {/* Texto tipo cuento (stagger) */}
              <motion.div
                variants={storyContainer}
                initial="hidden"
                animate="show"
                className="text-center min-h-[120px]"
              >
                <motion.p
                  variants={storyLine}
                  className="font-vibes text-white/95 text-3xl leading-tight"
                  animate={{
                    textShadow: [
                      "0 0 0px rgba(255,255,255,0.0)",
                      "0 0 14px rgba(255,255,255,0.35)",
                      "0 0 0px rgba(255,255,255,0.0)",
                    ],
                  }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  Había una vez, en el gran reino de la magia y los cuentos
                </motion.p>

                <motion.p
                  variants={storyLine}
                  className="font-cormorant text-white/90 text-lg leading-snug mt-1"
                >
                  una celebración muy especial que está por comenzar
                </motion.p>

                <motion.p
                  variants={storyLine}
                  className="font-poppins mt-3 text-white/85 text-sm leading-snug"
                >
                  ¡Te invitamos a estar en el cumpleaños de la princesa!
                </motion.p>
              </motion.div>

              {/* Bloque marco + listón */}
              <div className="relative mt-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="flex justify-center relative z-20 translate-y-6 -mb-6"
                >
                  <img
                    src="/images/marco-princesa.png"
                    alt="Marco dorado con rosas"
                    loading="eager"
                    className="w-[17rem] h-auto max-w-full drop-shadow-2xl"
                  />
                </motion.div>

                <motion.div
                  className="-mt-16 mx-auto w-full relative z-10"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.75, delay: 0.15 }}
                >
                  <div
                    className="relative mx-auto w-full rounded-xl px-4 py-3 shadow-lg"
                    style={{
                      background:
                        "linear-gradient(180deg, #E7D08B 0%, #C8A24A 45%, #9A7427 100%)",
                      border: "1px solid rgba(255,255,255,0.25)",
                    }}
                  >
                    <motion.p
                      className="text-center text-3xl font-extrabold italic"
                      style={{ color: "#7A1433" }}
                      animate={{
                        textShadow: [
                          "0 1px 2px rgba(0,0,0,0.35)",
                          "0 0 10px rgba(255,255,255,0.55)",
                          "0 0 16px rgba(255,255,255,0.75)",
                          "0 1px 2px rgba(0,0,0,0.35)",
                        ],
                      }}
                      transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {nombre}
                    </motion.p>
                  </div>
                </motion.div>
              </div>

              <div className="relative mt-4">
                <img
                  src="/images/frame-bella.png"
                  alt=""
                  className="absolute inset-0 w-full h-full object-contain object-center opacity-90"
                  aria-hidden="true"
                />

                <div className="relative z-10 px-2 py-6">
                  <motion.div
                    className="flex justify-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, delay: 0.3 }}
                  >
                    <img
                      src="/images/img_anio.png"
                      alt="Cumple 4 años"
                      className="w-[72%] max-w-[290px] h-auto"
                      loading="eager"
                    />
                  </motion.div>

                  {/* Contador */}
                  <motion.div
                    className="mt-6 mx-auto w-[92%] max-w-[360px] rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 px-4 py-4"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, delay: 0.45 }}
                  >
                    <p className="text-center text-[11px] tracking-widest text-white/80">
                      {timeLeft.diff === 0 ? "¡HOY ES EL GRAN DÍA!" : "FALTA POCO"}
                    </p>

                    {timeLeft.diff > 0 ? (
                      <div className="mt-3 grid grid-cols-4 gap-2">
                        {[
                          { label: "DÍAS", value: pad2(timeLeft.days) },
                          { label: "HRS", value: pad2(timeLeft.hours) },
                          { label: "MIN", value: pad2(timeLeft.minutes) },
                          { label: "SEG", value: pad2(timeLeft.seconds) },
                        ].map((x) => (
                          <div
                            key={x.label}
                            className="rounded-xl bg-white/10 border border-white/10 px-2 py-3 text-center"
                          >
                            <p className="text-[26px] leading-none font-extrabold text-white">
                              {x.value}
                            </p>
                            <p className="mt-1 text-[10px] text-white/70 tracking-widest">
                              {x.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-center text-sm text-white/90">
                        ¡Te esperamos hoy a las{" "}
                        <span className="font-semibold">{horaTexto}</span>!
                      </p>
                    )}
                  </motion.div>

                  {/* Texto de invitación */}
                  <motion.div
                    className="mt-6 text-center text-white/95 text-sm leading-relaxed"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.75, delay: 0.55 }}
                  >
                    <p className="font-cormorant text-lg tracking-wide drop-shadow-[0_1px_6px_rgba(0,0,0,0.45)]">
                      Te invitamos a una tarde mágica para celebrar a{" "}
                      <span className="font-semibold text-[#F7E3A1]">{nombre}</span>.
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Detalles */}
              <motion.div
                className="mt-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.75, delay: 0.6 }}
              >
                <div className="flex items-center justify-center gap-2 text-white">
                  <Calendar className="w-4 h-4" />
                  <p className="text-sm font-semibold">
                    {fechaTexto} · {horaTexto}
                  </p>
                </div>

                <div className="mt-3 text-center text-white/90 text-sm leading-relaxed">
                  <p className="inline-flex items-start gap-2 justify-center">
                    <MapPin className="w-4 h-4 mt-[2px]" />
                    <span>
                      {direccionLineas[0]}
                      <br />
                      {direccionLineas[1]}
                      <br />
                      {direccionLineas[2]}
                    </span>
                  </p>

                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-4 rounded-full px-5 py-2 text-sm font-semibold text-white shadow-md active:scale-[0.99]"
                    style={{
                      background: "linear-gradient(180deg, #C8A24A 0%, #9A7427 100%)",
                    }}
                  >
                    Cómo llegar
                  </a>
                </div>
              </motion.div>

              <div className="mt-6 text-center text-[10px] text-white/60">
                Hecho por <strong>RedballSystems</strong> para ver en móvil
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
