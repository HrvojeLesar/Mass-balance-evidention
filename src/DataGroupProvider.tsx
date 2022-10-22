import {
    createContext,
    ReactNode,
    useCallback,
    useMemo,
    useState,
} from "react";
import { DataGroup, useGetDataGroupsQuery } from "./generated/graphql";

type DataGroupContextType = {
    groups: DataGroup[];
    isLoading: boolean | undefined;
    selectGroup: ((id: number) => void) | undefined;
    selectedGroup: number | undefined;
    refetch: (() => void) | undefined;
};

const initialContext: DataGroupContextType = {
    groups: [],
    isLoading: undefined,
    selectedGroup: undefined,
    selectGroup: undefined,
    refetch: undefined,
};

export const DataGroupContext =
    createContext<DataGroupContextType>(initialContext);

type DataGroupProviderProps = {
    children?: ReactNode;
};

export default function DataGroupProvider({
    children,
}: DataGroupProviderProps) {
    const { data, isLoading, refetch } = useGetDataGroupsQuery(
        {},
        { queryKey: ["getDataGroups"], keepPreviousData: true }
    );
    // TODO: read selected group from disk/cookie
    const [selectedGroup, setSelectedGroup] = useState<number | undefined>(
        undefined
    );

    const selectGroup = useCallback((id: number) => {
        setSelectedGroup(id);
    }, []);

    const value: DataGroupContextType = useMemo(
        () => ({
            isLoading,
            groups: data?.dataGroups ?? [],
            selectedGroup: selectedGroup ?? data?.dataGroups.at(0)?.id,
            selectGroup,
            refetch,
        }),
        [isLoading, data, selectedGroup, selectGroup, refetch]
    );
    return (
        <DataGroupContext.Provider value={value}>
            {children}
        </DataGroupContext.Provider>
    );
}
