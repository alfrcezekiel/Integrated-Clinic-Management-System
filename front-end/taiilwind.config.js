// tailwind.config.js
export default {
    prefix: 'tw-',
    important: "#root",
    preflight: false,
    content: [
        './index.html',
        './src/**/*.{.html,js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {},
    },
    corePlugins: {
        preflight: false
    },
    plugins: [],
}