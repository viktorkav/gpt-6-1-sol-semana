import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight } from "@phosphor-icons/react";
import KeyVisual from "./KeyVisual.jsx";
import ArtistImage from "./ArtistImage.jsx";

const currents = [
  {
    id: "baianasystem",
    name: "BaianaSystem",
    day: "Sexta, 15",
    word: "O corpo vira corrente.",
    position: "50% 53%",
    tone: "night",
  },
  {
    id: "duda-beat",
    name: "Duda Beat",
    day: "Sábado, 16",
    word: "O afeto ocupa a pista.",
    position: "59% 42%",
    tone: "pop",
  },
  {
    id: "liniker",
    name: "Liniker",
    day: "Domingo, 17",
    word: "A voz atravessa tudo.",
    position: "50% 38%",
    tone: "soul",
  },
];

export default function FestivalHero({ frequency, setFrequency, openArtist }) {
  const [active, setActive] = useState(0);
  const hero = useRef(null);
  const photo = useRef(null);
  const current = currents[active];
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = media.matches
          ? 0
          : Math.min(
              85,
              Math.max(0, -hero.current.getBoundingClientRect().top) * 0.12,
            );
        photo.current?.style.setProperty("--photo-y", `${y}px`);
      });
    };
    update();
    addEventListener("scroll", update, { passive: true });
    media.addEventListener("change", update);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", update);
      media.removeEventListener("change", update);
    };
  }, []);
  return (
    <section
      ref={hero}
      className={`festival-hero tone-${current.tone}`}
      aria-labelledby="festival-name"
    >
      <div ref={photo} className="hero-photograph" key={current.id}>
        <ArtistImage id={current.id} eager position={current.position} />
      </div>
      <div className="hero-photo-shade" aria-hidden="true" />
      <div className="hero-service">
        <span>15—17 OUTUBRO 2027</span>
        <span>RECIFE / PE</span>
      </div>
      <div className="hero-copy">
        <p className="hero-invitation">
          Três noites.
          <br />
          Sem seguir a corrente.
        </p>
        <h1 id="festival-name" aria-label="CONTRA MARÉ">
          <span>CONTRA</span>
          <span>MARÉ</span>
        </h1>
        <a className="button sun" href="#lineup">
          Mergulhe no lineup <ArrowDown size={21} />
        </a>
      </div>
      <div className="hero-wave" aria-hidden="true">
        <KeyVisual frequency={frequency} />
      </div>
      <div className="hero-current-caption" aria-live="polite">
        <span>{current.day} / Palco Maré</span>
        <button
          aria-label={`Conhecer ${current.name}`}
          onClick={() => openArtist(current.id)}
        >
          {current.name}
          <ArrowUpRight size={25} />
        </button>
        <p>{current.word}</p>
        <small>
          Fotografia do acervo do artista.
          <br />
          Encontro imaginário no CONTRA-MARÉ.
        </small>
      </div>
      <div className="hero-control-dock">
        <div
          className="current-picker"
          role="group"
          aria-label="Escolha a corrente visual"
        >
          {currents.map((c, i) => (
            <button
              key={c.id}
              aria-label={`Ver corrente de ${c.name}`}
              aria-pressed={i === active}
              onClick={() => setActive(i)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              {c.name}
              <i aria-hidden="true" />
            </button>
          ))}
        </div>
        <div className="frequency-control">
          <label htmlFor="frequency">
            Mude a frequência <span>Sem áudio</span>
          </label>
          <input
            id="frequency"
            aria-label="Mude a frequência visual"
            type="range"
            min="0"
            max="100"
            value={frequency}
            onChange={(e) => setFrequency(Number(e.target.value))}
          />
          <span className="frequency-value" aria-hidden="true">
            {String(frequency).padStart(3, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
