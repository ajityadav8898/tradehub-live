
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { useEffect, useMemo, useState } from "react";
import { loadSlim } from "@tsparticles/slim";

const ParticlesComponent = (props) => {
    const [init, setInit] = useState(false);

    useEffect(() => {
        initParticlesEngine(async (engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const particlesLoaded = (container) => {
        console.log(container);
    };

    const options = useMemo(
        () => ({
            background: {
                color: {
                    value: "#000000",
                },
                image: "",
                position: "50% 50%",
                repeat: "no-repeat",
                size: "cover",
            },
            fpsLimit: 60,
            interactivity: {
                events: {
                    onClick: {
                        enable: true,
                        mode: "repulse",
                    },
                    onHover: {
                        enable: true,
                        mode: "grab",
                    },
                },
                modes: {
                    repulse: {
                        distance: 200,
                        duration: 0.4,
                    },
                    grab: {
                        distance: 200,
                        line_linked: {
                            opacity: 0.8,
                        },
                    },
                },
            },
            particles: {
                color: {
                    value: "#ffffff",
                },
                links: {
                    color: "#ffffff",
                    distance: 150,
                    enable: true,
                    opacity: 0.4,
                    width: 1,
                },
                move: {
                    direction: "none",
                    enable: true,
                    outModes: {
                        default: "bounce",
                    },
                    random: true,
                    speed: 2,
                    straight: false,
                    attract: {
                        enable: true,
                        rotateX: 600,
                        rotateY: 600,
                    },
                },
                number: {
                    density: {
                        enable: true,
                        area: 800,
                    },
                    value: 200,
                },
                opacity: {
                    value: 0.8,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                    },
                },
                shape: {
                    type: "circle",
                },
                size: {
                    value: { min: 1, max: 6 },
                    anim: {
                        enable: true,
                        speed: 4,
                        size_min: 1,
                    },
                },
            },
            detectRetina: true,
        }),
        []
    );

    if (init) {
        return (
            <Particles
                id={props.id}
                particlesLoaded={particlesLoaded}
                options={options}
                className={props.className} // Allow passing className for positioning
            />
        );
    }

    return <></>;
};

export default ParticlesComponent;
