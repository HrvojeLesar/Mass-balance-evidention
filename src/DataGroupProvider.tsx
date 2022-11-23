import {
    createContext,
    ReactNode,
    useCallback,
    useEffect,
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

const SELECTED_DATA_GROUP_ID = "selectedDataGroupId";

export default function DataGroupProvider({
    children,
}: DataGroupProviderProps) {
    const { data, isLoading, refetch } = useGetDataGroupsQuery(
        {},
        { queryKey: ["getDataGroups"], keepPreviousData: true }
    );

    const [selectedGroup, setSelectedGroup] = useState<number | undefined>(
        undefined
    );

    const groups = useMemo(() => {
        return data !== undefined
            ? [...data.dataGroups].sort((a, b) => a.id - b.id)
            : [];
    }, [data]);

    const selectGroup = useCallback((id: number) => {
        localStorage.setItem(SELECTED_DATA_GROUP_ID, id.toString());
        setSelectedGroup(id);
    }, []);

    const initialGroupId = useMemo(() => {
        const dgId = localStorage.getItem(SELECTED_DATA_GROUP_ID);
        if (dgId !== null) {
            const id = Number(dgId);
            return isNaN(id) ? undefined : id;
        } else {
            localStorage.removeItem(SELECTED_DATA_GROUP_ID);
            return undefined;
        }
    }, []);

    const value: DataGroupContextType = useMemo(
        () => ({
            isLoading,
            groups,
            selectedGroup: selectedGroup ?? initialGroupId,
            selectGroup,
            refetch,
        }),
        [isLoading, selectedGroup, selectGroup, refetch, groups, initialGroupId]
    );

    useEffect(() => {
        const storedId = localStorage.getItem(SELECTED_DATA_GROUP_ID);
        if (
            initialGroupId === undefined &&
            value.selectedGroup === undefined &&
            value.groups.length > 0
        ) {
            const id = value.groups[0].id;
            setSelectedGroup(id);
            localStorage.setItem(SELECTED_DATA_GROUP_ID, id.toString());
        } else if (
            storedId !== null &&
            value.selectedGroup !== undefined &&
            value.selectedGroup.toString() !== storedId
        ) {
            setSelectedGroup(value.selectedGroup);
        }
    }, [initialGroupId, value.selectedGroup, value.groups]);

    return (
        <DataGroupContext.Provider value={value}>
            {children}
        </DataGroupContext.Provider>
    );
}
