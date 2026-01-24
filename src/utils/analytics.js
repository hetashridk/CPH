import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = "G-KFFWPJ4F0K"; // Replace with your actual Measurement ID

export const initGA = () => {
    ReactGA.initialize(GA_MEASUREMENT_ID);
};

export const trackPageView = (path) => {
    ReactGA.send({ hitType: "pageview", page: path });
};

export const trackEvent = (category, action, label) => {
    ReactGA.event({
        category: category,
        action: action,
        label: label,
    });
};

export default { initGA, trackPageView, trackEvent };
