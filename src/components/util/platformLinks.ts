const createLink = (baseUrl: string) => {
    return `${baseUrl}${
        import.meta.env.TAURI_PLATFORM && !import.meta.env.TAURI_DEBUG
            ? "?platform=tauri"
            : ""
    }`;
};

export default createLink;
