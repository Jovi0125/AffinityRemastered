"use client";

import { useState } from "react";
import Image from "next/image";

interface Post {
  src: string;
  author: string;
  caption: string;
}

export function PostGridItem({ post }: { post: Post }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: "4px",
        aspectRatio: "4/3",
        cursor: "pointer",
      }}
    >
      <Image
        src={post.src}
        alt={post.caption}
        fill
        sizes="(max-width: 768px) 50vw, 33vw"
        style={{
          objectFit: "cover",
          filter: "grayscale(100%)",
          transform: hovered ? "scale(1.04)" : "scale(1)",
          transition: "transform 0.5s ease",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s ease",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "1.25rem",
        }}
      >
        <p style={{ fontSize: "0.8125rem", color: "#fff", fontWeight: 400 }}>
          {post.caption}
        </p>
        <p style={{ fontSize: "0.6875rem", color: "rgba(255,255,255,0.6)", marginTop: "0.25rem" }}>
          by {post.author}
        </p>
      </div>
    </div>
  );
}
