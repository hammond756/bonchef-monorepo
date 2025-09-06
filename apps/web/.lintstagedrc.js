export default {
    "src/**/*.{js,jsx,ts,tsx}": ["prettier --write", "next lint --fix --file"],
    "*.{json,md,yml,yaml}": ["prettier --write"],
}
