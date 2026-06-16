import dynamic from "next/dynamic";

const StarCanvas = dynamic(() => import("./StarCanvas"), {
  ssr: false,
  loading: () => <CssStarBackground />,
});

function CssStarBackground() {
  return (
    <div className="fixed inset-0 z-[0] pointer-events-none overflow-hidden">
      <div className="absolute inset-0 star-layer star-layer-one" />
      <div className="absolute inset-0 star-layer star-layer-two" />
      <div className="absolute inset-0 star-layer star-layer-three" />

      <style jsx>{`
        .star-layer {
          opacity: 0.78;
          will-change: transform, opacity;
          background-repeat: repeat;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        .star-layer-one {
          background-image:
            radial-gradient(circle, rgba(255, 255, 255, 0.9) 0 1px, transparent 1.4px),
            radial-gradient(circle, rgba(96, 165, 250, 0.7) 0 1px, transparent 1.5px);
          background-size: 92px 92px, 137px 137px;
          background-position: 8px 18px, 42px 64px;
          animation-name: drift-one;
          animation-duration: 86s;
        }

        .star-layer-two {
          background-image:
            radial-gradient(circle, rgba(255, 255, 255, 0.85) 0 1.2px, transparent 1.8px),
            radial-gradient(circle, rgba(167, 139, 250, 0.58) 0 1px, transparent 1.6px);
          background-size: 168px 168px, 214px 214px;
          background-position: 74px 32px, 19px 96px;
          animation-name: drift-two;
          animation-duration: 124s;
        }

        .star-layer-three {
          opacity: 0.38;
          background-image: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.95) 0 1.6px,
            transparent 2.2px
          );
          background-size: 260px 260px;
          background-position: 118px 42px;
          animation: drift-three 160s linear infinite, twinkle 5.6s ease-in-out infinite;
        }

        @keyframes drift-one {
          to {
            transform: translate3d(-92px, 92px, 0);
          }
        }

        @keyframes drift-two {
          to {
            transform: translate3d(84px, 168px, 0);
          }
        }

        @keyframes drift-three {
          to {
            transform: translate3d(-130px, 260px, 0);
          }
        }

        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.32;
          }
          50% {
            opacity: 0.58;
          }
        }
      `}</style>
    </div>
  );
}

export default function StarBackground({ useWebGL = true }) {
  if (!useWebGL) {
    return <CssStarBackground />;
  }

  return <StarCanvas />;
}
