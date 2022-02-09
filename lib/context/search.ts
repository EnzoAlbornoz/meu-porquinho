import { createContext, type Dispatch, type SetStateAction } from "react";

export const SearchContext = createContext<{
    search: string;
    setSearch: Dispatch<SetStateAction<string>>;
}>({
    search: "",
    setSearch: () => {},
});
