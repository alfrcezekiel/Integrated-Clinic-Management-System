import { useContext, createContext } from "react";

export const MaterialUIContext = createContext(null);
MaterialUIContext.displayName = "MaterialUIContext";

export const useMaterialUIController = () => {
    const context = useContext(MaterialUIContext);
    if (!context) {
        throw new Error("useMaterialUIController must be used within a MaterialUIProvider");
    }
    return context;
}