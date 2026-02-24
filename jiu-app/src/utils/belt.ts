export const translateBelt = (color: string | undefined | null) => {
    if (!color) return '';
    const map: Record<string, string> = {
        white: "Branca",
        grey: "Cinza",
        yellow: "Amarela",
        orange: "Laranja",
        green: "Verde",
        blue: "Azul",
        purple: "Roxa",
        brown: "Marrom",
        black: "Preta",
        red: "Vermelha",
        coral: "Coral"
    };
    return map[color.toLowerCase()] || color;
};
