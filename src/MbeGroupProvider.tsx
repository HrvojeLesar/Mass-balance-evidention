import {
    createContext,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { MbeGroup, useGetMbeGroupsQuery } from "./generated/graphql";

type MbeGroupContextType = {
    groups: MbeGroup[] | undefined;
    isEmpty: boolean;
    isLoading: boolean | undefined;
    selectGroup: ((id: number) => void) | undefined;
    selectedGroup: number | undefined;
    refetch: (() => void) | undefined;
};

const initialContext: MbeGroupContextType = {
    groups: undefined,
    isEmpty: true,
    isLoading: undefined,
    selectedGroup: undefined,
    selectGroup: undefined,
    refetch: undefined,
};

export const MbeGroupContext =
    createContext<MbeGroupContextType>(initialContext);

type MbeGroupProviderProps = {
    children?: ReactNode;
};

const SELECTED_MBE_GROUP_ID = "selectedMbeGroupId";

export default function MbeGroupProvider({ children }: MbeGroupProviderProps) {
    const { data, isLoading, refetch } = useGetMbeGroupsQuery(
        { options: {} as never },
        { queryKey: ["getMbeGroups"], keepPreviousData: true }
    );

    const [selectedGroup, setSelectedGroup] = useState<number | undefined>(
        undefined
    );

    const groups = useMemo(() => {
        return data !== undefined
            ? [...data.mbeGroups].sort((a, b) => a.id - b.id)
            : undefined;
    }, [data]);

    const selectGroup = useCallback((id: number) => {
        localStorage.setItem(SELECTED_MBE_GROUP_ID, id.toString());
        setSelectedGroup(id);
    }, []);

    const initialGroupId = useMemo(() => {
        const dgId = localStorage.getItem(SELECTED_MBE_GROUP_ID);
        if (dgId !== null) {
            const id = Number(dgId);
            return isNaN(id) ? undefined : id;
        } else {
            localStorage.removeItem(SELECTED_MBE_GROUP_ID);
            return undefined;
        }
    }, []);

    const isEmpty = useMemo((): boolean => {
        if (groups) {
            return groups.length === 0 ? true : false;
        } else {
            return true;
        }
    }, [groups]);

    const value: MbeGroupContextType = useMemo(
        () => ({
            isLoading,
            isEmpty,
            groups,
            selectedGroup: selectedGroup ?? initialGroupId,
            selectGroup,
            refetch,
        }),
        [
            isLoading,
            selectedGroup,
            selectGroup,
            refetch,
            groups,
            initialGroupId,
            isEmpty,
        ]
    );

    useEffect(() => {
        const storedId = localStorage.getItem(SELECTED_MBE_GROUP_ID);
        if (
            initialGroupId === undefined &&
            value.selectedGroup === undefined &&
            value.groups !== undefined &&
            value.groups.length > 0
        ) {
            const id = value.groups[0].id;
            setSelectedGroup(id);
            localStorage.setItem(SELECTED_MBE_GROUP_ID, id.toString());
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
            localStorage.setItem(SELECTED_MBE_GROUP_ID, id.toString());
        } else if (
            storedId !== null &&
            value.groups !== undefined &&
            value.groups.length === 0
        ) {
            setSelectedGroup(undefined);
            localStorage.removeItem(SELECTED_MBE_GROUP_ID);
        }
    }, [initialGroupId, value.selectedGroup, value.groups]);

    return (
        <MbeGroupContext.Provider value={value}>
            {children}
        </MbeGroupContext.Provider>
    );
}
