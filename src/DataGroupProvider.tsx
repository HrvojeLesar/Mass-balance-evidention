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
    groups: DataGroup[] | undefined;
    isLoading: boolean | undefined;
    selectGroup: ((id: number) => void) | undefined;
    selectedGroup: number | undefined;
    refetch: (() => void) | undefined;
};

const initialContext: DataGroupContextType = {
    groups: undefined,
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
        { options: {} },
        { queryKey: ["getDataGroups"], keepPreviousData: true }
    );

    const [selectedGroup, setSelectedGroup] = useState<number | undefined>(
        undefined
    );

    const groups = useMemo(() => {
        return data !== undefined
            ? [...data.dataGroups.results].sort((a, b) => a.id - b.id)
            : undefined;
    }, [data]);

    const selectGroup = useCallback((id: number) => {
        console.log("selectedGroups");
        localStorage.setItem(SELECTED_DATA_GROUP_ID, id.toString());
        setSelectedGroup(id);
    }, []);

    const initialGroupId = useMemo(() => {
        console.log("initialGroup");
        const dgId = localStorage.getItem(SELECTED_DATA_GROUP_ID);
        if (dgId !== null) {
            const id = Number(dgId);
            return isNaN(id) ? undefined : id;
        } else {
            console.log("rem");
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
        console.log("useeffect");
        const storedId = localStorage.getItem(SELECTED_DATA_GROUP_ID);
        if (
            initialGroupId === undefined &&
            value.selectedGroup === undefined &&
            value.groups !== undefined &&
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
        } else if (
            value.groups !== undefined &&
            value.groups.length > 0 &&
            value.groups.find((dg) => dg.id.toString() === storedId) ===
            undefined
        ) {
            const id = value.groups[0].id;
            setSelectedGroup(id);
            localStorage.setItem(SELECTED_DATA_GROUP_ID, id.toString());
        } else if (
            storedId !== null &&
            value.groups !== undefined &&
            value.groups.length === 0
        ) {
            setSelectedGroup(undefined);
            console.log("remov");
            localStorage.removeItem(SELECTED_DATA_GROUP_ID);
        }
    }, [initialGroupId, value.selectedGroup, value.groups]);

    console.log(localStorage.getItem(SELECTED_DATA_GROUP_ID));

    return (
        <DataGroupContext.Provider value={value}>
            {children}
        </DataGroupContext.Provider>
    );
}
