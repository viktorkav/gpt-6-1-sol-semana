import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  CalendarBlank,
  Check,
  DownloadSimple,
  Heart,
  MagnifyingGlass,
  Minus,
  Plus,
  Ticket,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import artists from "./data/artists.json";
import { days, shows, stages } from "./data/program.js";
import {
  buildCalendar,
  getConflicts,
  readFavorites,
  timeMinutes,
  writeFavorites,
} from "./lib/agenda.js";
import KeyVisual from "./KeyVisual.jsx";
import ArtistImage from "./ArtistImage.jsx";
import FestivalHero from "./FestivalHero.jsx";
import photos from "./data/photos.json";

const artistById = Object.fromEntries(artists.map((a) => [a.id, a]));
const showByArtist = Object.fromEntries(shows.map((s) => [s.artistId, s]));
const normalize = (text) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const dayFor = (show) => days.find((d) => d.id === show.day);

function Modal({ children, onClose, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const active = document.activeElement;
    const dialog = ref.current;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      active?.focus();
    };
  }, []);
  const trapTab = (e) => {
    if (e.key !== "Tab") return;
    const focusable = [
      ...ref.current.querySelectorAll(
        "button, a[href], input, select, [tabindex]",
      ),
    ].filter(
      (el) => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length,
    );
    const first = focusable[0],
      last = focusable.at(-1);
    if (
      (!e.shiftKey && document.activeElement === last) ||
      (e.shiftKey && document.activeElement === first)
    ) {
      e.preventDefault();
      (e.shiftKey ? last : first)?.focus();
    }
  };
  return (
    <dialog
      onKeyDown={trapTab}
      ref={ref}
      className={`modal ${className}`}
      aria-labelledby="dialog-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button
        autoFocus
        className="close-button"
        aria-label="Fechar janela"
        onClick={onClose}
      >
        <X size={25} />
      </button>
      {children}
    </dialog>
  );
}

function FavoriteButton({ show, favorites, toggle, compact = false }) {
  const selected = favorites.includes(show.id);
  const artist = artistById[show.artistId];
  return (
    <button
      className={`favorite-button ${selected ? "selected" : ""} ${compact ? "compact" : ""}`}
      aria-pressed={selected}
      aria-label={
        selected
          ? `Remover ${artist.name} dos favoritos`
          : `Favoritar ${artist.name}`
      }
      onClick={() => toggle(show.id)}
    >
      <Heart weight={selected ? "fill" : "regular"} size={23} />
      {!compact && (
        <span>{selected ? "Na sua agenda" : "Guardar na agenda"}</span>
      )}
    </button>
  );
}

function ShowItem({ show, favorites, toggle, openArtist, timeline = false }) {
  const artist = artistById[show.artistId];
  const position = timeline
    ? {
        top: `${(timeMinutes(show.start) - 1080) / 3}%`,
        height: `${(timeMinutes(show.end) - timeMinutes(show.start)) / 3}%`,
      }
    : {};
  return (
    <article
      className={`show-item ${timeline ? "on-timeline" : ""} ${show.stage}`}
      style={position}
    >
      <div className="show-meta">
        <span>
          {show.start} — {show.end}
        </span>
        <span className="mobile-stage">Palco {stages[show.stage].name}</span>
      </div>
      <ArtistImage id={artist.id} decorative className="show-photo" />
      <div className="show-content">
        <button
          className="artist-link"
          aria-label={`Ver detalhes de ${artist.name}`}
          onClick={() => openArtist(artist.id)}
        >
          {artist.name}
          <ArrowUpRight size={22} />
        </button>
        <FavoriteButton
          show={show}
          favorites={favorites}
          toggle={toggle}
          compact
        />
      </div>
      <p>{artist.tag}</p>
    </article>
  );
}

function ArtistDetail({ artist, favorites, toggle, onClose }) {
  const show = showByArtist[artist.id];
  return (
    <Modal onClose={onClose} className="artist-modal">
      <div className="artist-detail-top">
        <ArtistImage id={artist.id} eager className="artist-detail-photo" />
        <div className="artist-detail-overlay" aria-hidden="true" />
        <span>Encontro imaginário / {dayFor(show).short}</span>
        <h2 id="dialog-title">{artist.name}</h2>
        <span>{artist.tag}</span>
      </div>
      <div className="artist-detail-body">
        <div className="detail-slot">
          <CalendarBlank size={26} />
          <p>
            {dayFor(show).label}
            <strong>
              {show.start} — {show.end} / Palco {stages[show.stage].name}
            </strong>
          </p>
        </div>
        <p className="artist-description">{artist.description}</p>
        <FavoriteButton show={show} favorites={favorites} toggle={toggle} />
        <a
          className="source-link"
          href={artist.url}
          target="_blank"
          rel="noreferrer"
        >
          Conheça o trabalho na fonte oficial <ArrowUpRight size={19} />
        </a>
        <p className="photo-credit">
          Fotografia: {photos[artist.id].credit}.{" "}
          <a
            href={photos[artist.id].sourcePage}
            target="_blank"
            rel="noreferrer"
          >
            Ver origem <ArrowUpRight size={13} />
          </a>
        </p>
        <p className="fine-print">
          Participação imaginária neste festival fictício.
        </p>
      </div>
    </Modal>
  );
}

function Agenda({ favorites, toggle, onClose }) {
  const selected = shows
    .filter((s) => favorites.includes(s.id))
    .sort(
      (a, b) =>
        a.day.localeCompare(b.day) ||
        timeMinutes(a.start) - timeMinutes(b.start),
    );
  const conflicts = getConflicts(selected);
  const conflictIds = new Set(
    conflicts.flatMap((c) => [c.first.id, c.second.id]),
  );
  const [downloadError, setDownloadError] = useState("");
  const download = () => {
    try {
      const url = URL.createObjectURL(
        new Blob([buildCalendar(selected, artists)], {
          type: "text/calendar;charset=utf-8",
        }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = "contra-mare-agenda-simulacao.ics";
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setDownloadError(
        "Não foi possível gerar o arquivo. Tente baixar novamente.",
      );
    }
  };
  return (
    <Modal onClose={onClose} className="agenda-modal">
      <div className="modal-heading">
        <span>
          Minha agenda / {selected.length}{" "}
          {selected.length === 1 ? "show" : "shows"}
        </span>
        <h2 id="dialog-title">
          Sua maré,
          <br />
          seus shows.
        </h2>
        <p>Os corações ficam neste navegador. Os encontros ficam com você.</p>
      </div>
      {!selected.length ? (
        <div className="empty-agenda">
          <Heart size={50} />
          <h3>Sua agenda começa com um coração.</h3>
          <p>
            Guarde os shows na programação e veja aqui onde os horários se
            encontram.
          </p>
          <button className="button blue" onClick={onClose}>
            Explorar programação <ArrowRight size={20} />
          </button>
        </div>
      ) : (
        <>
          {conflicts.length > 0 && (
            <div className="conflicts">
              <h3>
                <WarningCircle size={22} /> Você vai precisar escolher
              </h3>
              {conflicts.map((c) => (
                <p key={`${c.first.id}-${c.second.id}`}>
                  <strong>
                    {artistById[c.first.artistId].name} +{" "}
                    {artistById[c.second.artistId].name}
                  </strong>
                  <span>
                    {dayFor(c.first).short} / {c.minutes} min de sobreposição
                  </span>
                </p>
              ))}
            </div>
          )}
          <div className="agenda-days">
            {days
              .filter((d) => selected.some((s) => s.day === d.id))
              .map((d) => (
                <section key={d.id}>
                  <h3>{d.label}</h3>
                  {selected
                    .filter((s) => s.day === d.id)
                    .map((s) => (
                      <div
                        className={`agenda-show ${conflictIds.has(s.id) ? "has-conflict" : ""}`}
                        key={s.id}
                      >
                        <div>
                          <span>
                            {s.start} — {s.end} / {stages[s.stage].name}
                          </span>
                          <h4>{artistById[s.artistId].name}</h4>
                        </div>
                        <FavoriteButton
                          show={s}
                          favorites={favorites}
                          toggle={toggle}
                          compact
                        />
                      </div>
                    ))}
                </section>
              ))}
          </div>
          <div className="agenda-download">
            <button className="button blue" onClick={download}>
              Baixar agenda (.ics) <DownloadSimple size={20} />
            </button>
            <p>
              Calendário de simulação, horário de Recife (UTC−3). Conflitos são
              sobreposições de shows; deslocamento entre palcos não está
              incluído.
            </p>
            {downloadError && (
              <p role="alert" className="error-message">
                {downloadError}
              </p>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}

function TicketFlow({ onClose }) {
  const [pass, setPass] = useState("all");
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState(0);
  const stepTitle = useRef(null);
  useEffect(() => {
    if (step > 0) stepTitle.current?.focus();
  }, [step]);
  const passName =
    pass === "all" ? "Passe 3 dias" : days.find((d) => d.id === pass).label;
  const price = pass === "all" ? 420 : 180;
  const currency = (amount) =>
    amount.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 0,
    });
  return (
    <Modal onClose={onClose} className="ticket-modal">
      <div className="modal-heading">
        <span className="demo-badge">
          <Ticket size={18} /> Demonstração local
        </span>
        <h2 id="dialog-title" ref={stepTitle} tabIndex={-1}>
          {step === 2
            ? "Você entrou na experiência."
            : step === 1
              ? "Confira sua seleção."
              : "Seu lugar nessa maré."}
        </h2>
        <p>Festival fictício. Valores ilustrativos, sem transação real.</p>
      </div>
      {step === 0 && (
        <div className="ticket-form">
          <label htmlFor="pass">Passe</label>
          <select
            id="pass"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          >
            <option value="all">Passe 3 dias — R$ 420</option>
            {days.map((d) => (
              <option value={d.id} key={d.id}>
                {d.label} — R$ 180
              </option>
            ))}
          </select>
          <div className="quantity-row">
            <div>
              <strong>Quantas pessoas?</strong>
              <p>Até 4 nesta demonstração.</p>
            </div>
            <div className="stepper">
              <button
                aria-label="Diminuir quantidade"
                disabled={quantity === 1}
                onClick={() => setQuantity((q) => q - 1)}
              >
                <Minus size={20} />
              </button>
              <output aria-live="polite">{quantity}</output>
              <button
                aria-label="Aumentar quantidade"
                disabled={quantity === 4}
                onClick={() => setQuantity((q) => q + 1)}
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
          <div className="ticket-total">
            <span>Total ilustrativo</span>
            <strong>{currency(price * quantity)}</strong>
          </div>
          <button className="button blue wide" onClick={() => setStep(1)}>
            Revisar seleção <ArrowRight size={20} />
          </button>
        </div>
      )}
      {step === 1 && (
        <div className="ticket-form">
          <div className="ticket-review">
            <span>{passName}</span>
            <strong>
              {quantity} {quantity === 1 ? "pessoa" : "pessoas"}
            </strong>
            <span>15–17 outubro 2027 / Recife</span>
          </div>
          <div className="ticket-total">
            <span>Total ilustrativo</span>
            <strong>{currency(price * quantity)}</strong>
          </div>
          <p className="fine-print">
            Nenhuma cobrança, reserva ou informação pessoal será enviada. O
            próximo passo gera somente uma lembrança visual nesta página.
          </p>
          <button className="button blue wide" onClick={() => setStep(2)}>
            Gerar ingresso de demonstração <Ticket size={20} />
          </button>
          <button className="text-button" onClick={() => setStep(0)}>
            Voltar e editar
          </button>
        </div>
      )}
      {step === 2 && (
        <div className="ticket-form">
          <div className="souvenir">
            <span>CONTRA-MARÉ / 2027</span>
            <strong>{passName}</strong>
            <p>
              {quantity} {quantity === 1 ? "pessoa" : "pessoas"} / Recife, PE
            </p>
            <div className="ticket-waves" aria-hidden="true">
              <KeyVisual />
            </div>
            <b>SEM VALIDADE</b>
            <span>Conceito fictício · não é um ingresso real</span>
          </div>
          <p className="success-line">
            <Check size={21} /> Demonstração concluída. Nenhum pagamento foi
            feito.
          </p>
          <button className="button blue wide" onClick={onClose}>
            Voltar ao festival <ArrowRight size={20} />
          </button>
        </div>
      )}
    </Modal>
  );
}

export default function App() {
  const [day, setDay] = useState(days[0].id);
  const [stage, setStage] = useState("todos");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [storageError, setStorageError] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState(null);
  const [frequency, setFrequency] = useState(35);
  const [view, setView] = useState("horarios");
  const noticeTimer = useRef(null);
  useEffect(() => {
    try {
      const result = readFavorites(
        window.localStorage,
        shows.map((s) => s.id),
      );
      setFavorites(result.ids);
      setStorageError((previous) => result.error || previous);
    } catch {
      setStorageError(
        "O navegador bloqueou o armazenamento. Sua agenda funciona enquanto esta página estiver aberta.",
      );
    }
    return () => clearTimeout(noticeTimer.current);
  }, []);
  const toggle = (id) => {
    const selected = favorites.includes(id);
    const next = selected
      ? favorites.filter((f) => f !== id)
      : [...favorites, id];
    setFavorites(next);
    try {
      const result = writeFavorites(window.localStorage, next);
      if (result.error)
        setStorageError(`${result.error} Sua agenda funciona nesta sessão.`);
    } catch {
      setStorageError(
        "Não foi possível salvar. Sua agenda funciona nesta sessão.",
      );
    }
    setNotice(
      `${artistById[shows.find((s) => s.id === id).artistId].name} ${selected ? "saiu da" : "entrou na"} sua agenda.`,
    );
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(""), 3000);
  };
  const activeDay = days.find((d) => d.id === day);
  const visible = shows
    .filter(
      (s) =>
        s.day === day &&
        (stage === "todos" || stage === s.stage) &&
        normalize(artistById[s.artistId].name).includes(
          normalize(search.trim()),
        ),
    )
    .sort((a, b) => timeMinutes(a.start) - timeMinutes(b.start));
  const openArtist = (id) => setModal({ type: "artist", id });
  const jumpDay = (id) => {
    setDay(id);
    setStage("todos");
    setSearch("");
    document.getElementById("programacao").scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };
  return (
    <>
      <a className="skip-link" href="#programacao">
        Pular para programação
      </a>
      <header className="global-header">
        <div className="concept-strip">
          EVENTO FICTÍCIO <span /> Artistas reais / lineup conceitual
        </div>
        <div className="hero-shell" id="inicio">
          <div className="site-header">
            <a
              className="small-brand"
              href="#inicio"
              aria-label="Contra-Maré, início"
            >
              CONTRA
              <br />
              MARÉ<span>↗</span>
            </a>
            <nav aria-label="Navegação principal">
              <a href="#programacao">Programação</a>
              <a href="#festival">Festival</a>
              <button
                onClick={() => setModal({ type: "agenda" })}
                className="nav-agenda"
              >
                Minha agenda <span>{favorites.length}</span>
              </button>
            </nav>
            <button
              className="header-ticket"
              onClick={() => setModal({ type: "ticket" })}
            >
              Ingressos <ArrowUpRight size={20} />
            </button>
          </div>
        </div>
      </header>
      <main>
        <FestivalHero
          frequency={frequency}
          setFrequency={setFrequency}
          openArtist={openArtist}
        />
        <section
          id="lineup"
          className="lineup-section"
          aria-labelledby="lineup-title"
        >
          <div className="section-intro lineup-intro">
            <div>
              <span className="section-kicker">
                12 artistas. Todas as direções.
              </span>
              <h2 id="lineup-title">
                Quem faz
                <br />
                <em>a maré.</em>
              </h2>
            </div>
            <p>
              Tambor, guitarra, voz e grave.
              <br />
              Três noites para sair da margem.
            </p>
          </div>
          <div className="photo-lineup">
            {days.map((d, i) => {
              const headline = ["baianasystem", "duda-beat", "liniker"][i];
              const ordered = [
                headline,
                ...d.artists.filter((id) => id !== headline),
              ];
              return (
                <div className={`photo-day photo-day-${i}`} key={d.id}>
                  <div className="photo-day-heading">
                    <button
                      onClick={() => jumpDay(d.id)}
                      aria-label={`Ver programação de ${d.label}`}
                    >
                      <strong>{15 + i}</strong>
                      <span>{d.short.split(" ")[0]} / OUT</span>
                      <ArrowDown size={24} />
                    </button>
                    <h3>{d.title}</h3>
                    <span className="day-index">CORRENTE 0{i + 1}</span>
                  </div>
                  <div className="photo-day-artists">
                    {ordered.map((id, j) => (
                      <button
                        key={id}
                        className={`photo-artist ${j === 0 ? "photo-headliner" : ""}`}
                        onClick={() => openArtist(id)}
                        aria-label={`Ver detalhes de ${artistById[id].name}`}
                      >
                        <ArtistImage id={id} decorative />
                        <span className="photo-artist-label">
                          <span>{artistById[id].name}</span>
                          <ArrowUpRight size={25} />
                        </span>
                        <span className="photo-artist-tag">
                          {artistById[id].tag}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="lineup-note">
            Entre em uma foto. Conheça um som. Guarde um encontro na sua agenda.
          </p>
        </section>
        <section
          id="programacao"
          className="program-section"
          aria-labelledby="program-title"
        >
          <div className="section-intro">
            <div>
              <span className="section-kicker">Monte sua corrente</span>
              <h2 id="program-title">Na hora certa.</h2>
            </div>
            <p>
              Dois palcos, caminhos diferentes.
              <br />
              Escolha o dia e siga o seu ouvido.
            </p>
          </div>
          <div className="program-tools">
            <div className="day-tabs" role="group" aria-label="Dia do festival">
              {days.map((d) => (
                <button
                  key={d.id}
                  aria-pressed={day === d.id}
                  onClick={() => setDay(d.id)}
                >
                  {d.short}
                  <span>{d.id === day ? "Você está aqui" : d.title}</span>
                </button>
              ))}
            </div>
            <button
              className="agenda-program"
              onClick={() => setModal({ type: "agenda" })}
            >
              <Heart size={22} weight={favorites.length ? "fill" : "regular"} />
              <span>Minha agenda</span>
              <b>{favorites.length}</b>
            </button>
          </div>
          <div className="filter-row">
            <div className="day-description">
              <strong>{activeDay.title}</strong>
              <p>{activeDay.note}</p>
            </div>
            <div className="filter-controls">
              <label className="search-control">
                <MagnifyingGlass size={20} />
                <span className="sr-only">Buscar artista</span>
                <input
                  type="search"
                  placeholder="Buscar artista"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>
              <label className="stage-control">
                <span>Palco</span>
                <select
                  aria-label="Palco"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                >
                  <option value="todos">Todos</option>
                  <option value="mare">Maré</option>
                  <option value="mangue">Mangue</option>
                </select>
              </label>
              <div
                className="view-switch"
                role="group"
                aria-label="Visualização"
              >
                <button
                  aria-pressed={view === "horarios"}
                  onClick={() => setView("horarios")}
                >
                  Horários
                </button>
                <button
                  aria-pressed={view === "lista"}
                  onClick={() => setView("lista")}
                >
                  Lista
                </button>
              </div>
            </div>
          </div>
          <p className="results-label" aria-live="polite">
            {visible.length} {visible.length === 1 ? "show" : "shows"} /{" "}
            {activeDay.label} / horários de Recife (UTC−3)
          </p>
          {visible.length ? (
            <>
              <div
                className={`schedule-timeline ${view === "lista" ? "hidden-view" : ""}`}
              >
                <div className="time-gutter">
                  {[18, 19, 20, 21, 22, 23].map((h) => (
                    <span key={h} style={{ top: `${(h - 18) * 20}%` }}>
                      {h}:00
                    </span>
                  ))}
                </div>
                <div
                  className={`stage-columns ${stage !== "todos" ? "one-stage" : ""}`}
                >
                  {Object.keys(stages)
                    .filter((s) => stage === "todos" || stage === s)
                    .map((s) => (
                      <div className="stage-column" key={s}>
                        <div className="stage-heading">
                          <h3>Palco {stages[s].name}</h3>
                          <span>{stages[s].note}</span>
                        </div>
                        <div className="stage-track">
                          {[0, 20, 40, 60, 80, 100].map((t) => (
                            <div
                              className="time-rule"
                              key={t}
                              style={{ top: `${t}%` }}
                            />
                          ))}
                          {visible
                            .filter((v) => v.stage === s)
                            .map((show) => (
                              <ShowItem
                                key={show.id}
                                show={show}
                                favorites={favorites}
                                toggle={toggle}
                                openArtist={openArtist}
                                timeline
                              />
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              <div
                className={`schedule-list ${view === "lista" ? "explicit-list" : ""}`}
              >
                {visible.map((show) => (
                  <ShowItem
                    key={show.id}
                    show={show}
                    favorites={favorites}
                    toggle={toggle}
                    openArtist={openArtist}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="empty-results">
              <MagnifyingGlass size={36} />
              <h3>Nenhum som por aqui.</h3>
              <p>Tente outro nome ou volte a ver todos os palcos deste dia.</p>
              <button
                className="button blue"
                onClick={() => {
                  setSearch("");
                  setStage("todos");
                }}
              >
                Limpar busca <ArrowRight size={20} />
              </button>
            </div>
          )}
          <div className="program-bottom">
            <span>
              <Heart size={18} /> O coração guarda. A agenda avisa quando os
              shows se cruzam.
            </span>
            <span>15—17 OUT / RECIFE</span>
          </div>
        </section>
        <section
          id="festival"
          className="festival-section"
          aria-labelledby="festival-title"
        >
          <div className="festival-photo-collage">
            <ArtistImage id="nacao-zumbi" className="story-photo-main" />
            <ArtistImage id="luedji-luna" className="story-photo-portrait" />
            <div className="story-wave" aria-hidden="true">
              <KeyVisual frequency={80} />
            </div>
            <span className="story-stamp">
              ENTRE ÁGUAS.
              <br />
              ENTRE SONS.
            </span>
          </div>
          <div className="festival-story">
            <span className="section-kicker">
              Recife como ponto de encontro
            </span>
            <h2 id="festival-title">
              DO MANGUE
              <br />À PISTA.
            </h2>
            <p>
              Tem música que não cabe numa margem. O CONTRA-MARÉ imagina um cais
              onde o tambor encontra a guitarra, a voz atravessa o grave e cada
              palco abre um caminho.
            </p>
            <p>
              Três noites para escutar o Brasil por outras correntes. Uma cidade
              entre águas. Um festival que, por enquanto, existe na imaginação.
            </p>
            <div className="festival-facts">
              <div>
                <span>Quando</span>
                <strong>15–17 outubro 2027</strong>
              </div>
              <div>
                <span>Onde, neste conceito</span>
                <strong>Cais imaginário / Recife</strong>
              </div>
            </div>
            <button
              className="button ink"
              onClick={() => setModal({ type: "ticket" })}
            >
              Experimentar ingresso <ArrowUpRight size={20} />
            </button>
            <small>Fluxo local de demonstração. Sem venda ou reserva.</small>
          </div>
        </section>
      </main>
      <footer>
        <a className="footer-wordmark" href="#inicio">
          CONTRA-MARÉ
          <ArrowUpRight />
        </a>
        <div className="footer-bottom">
          <p>
            Recife como ponto de encontro.
            <br />
            Música brasileira em outras correntes.
          </p>
          <div>
            <a href="./referencias.html" target="_blank" rel="noreferrer">
              Fontes e sobre o conceito <ArrowUpRight size={17} />
            </a>
            <span>Conceito desenvolvido para ViktorKav / 2026</span>
          </div>
          <a href="#inicio" className="back-top">
            Voltar ao topo <ArrowUpRight size={20} />
          </a>
        </div>
      </footer>
      {storageError && (
        <div className="storage-warning" role="alert">
          <WarningCircle size={20} />
          <p>{storageError}</p>
          <button aria-label="Fechar aviso" onClick={() => setStorageError("")}>
            <X size={20} />
          </button>
        </div>
      )}
      <div
        className={`toast ${notice ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {notice && (
          <>
            <Check size={18} />
            {notice}
          </>
        )}
      </div>
      {modal?.type === "artist" && (
        <ArtistDetail
          artist={artistById[modal.id]}
          favorites={favorites}
          toggle={toggle}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "agenda" && (
        <Agenda
          favorites={favorites}
          toggle={toggle}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === "ticket" && (
        <TicketFlow onClose={() => setModal(null)} />
      )}
    </>
  );
}
