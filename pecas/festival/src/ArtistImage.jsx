import { useState } from "react";
import photos from "./data/photos.json";

export default function ArtistImage({
  id,
  className = "",
  eager = false,
  decorative = false,
  position,
}) {
  const [failed, setFailed] = useState(false);
  const photo = photos[id];
  return (
    <div
      data-artist={id}
      className={`artist-image ${className} ${failed ? "photo-unavailable" : ""}`}
    >
      {!failed && photo ? (
        <img
          src={`${import.meta.env.BASE_URL}${photo.src}`}
          alt={decorative ? "" : photo.alt}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          decoding="async"
          style={{ objectPosition: position || photo.position || "50% 40%" }}
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="photo-fallback">Foto indisponível</span>
      )}
    </div>
  );
}
