export const pageTransition = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.25 } }
};

export const modalExpand = {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1]
        }
    },
    exit: {
        opacity: 0,
        scale: 0.98,
        transition: { duration: 0.3 }
    }
};

export const modalBackdrop = {
    initial: { opacity: 0, backdropFilter: "blur(0px)" },
    animate: { opacity: 1, backdropFilter: "blur(12px)", transition: { duration: 0.4 } },
    exit: { opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0.3 } }
};

export const hoverScale = {
    rest: { scale: 1 },
    hover: { scale: 1.02, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
    tap: { scale: 0.98 }
};

export const staggerContainer = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.08
        }
    }
};

export const staggerItem = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
    }
};

export const leaderboardRow = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4 } }
};
