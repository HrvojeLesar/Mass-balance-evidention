import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { createContext, ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type Me = {
    id: number;
    email: string;
};

type AuthContextT = {
    authorized: boolean;
    email: string | undefined;
};

export const AuthContext = createContext<AuthContextT>({
    authorized: false,
    email: undefined,
});

type AuthContextProviderProps = {
    children?: ReactNode;
};

export default function AuthContextProvider({
    children,
}: AuthContextProviderProps) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [email, setEmail] = useState<undefined | string>(undefined);

    const navigate = useNavigate();
    const location = useLocation();

    const { data, isLoading, error } = useQuery({
        queryKey: ["authQuery"],
        queryFn: async () => {
            const { data } = await axios.get<Me>(import.meta.env.VITE_ME, {
                withCredentials: true,
            });
            return data;
        },
    });

    useEffect(() => {
        if (data?.email && !error) {
            setIsAuthorized(true);
            setEmail(data?.email);
        } else {
            setIsAuthorized(false);
        }
    }, [data?.email, error]);

    useEffect(() => {
        if (
            location.pathname !== "/login" &&
            location.pathname !== "/login-callback" &&
            isLoading === false &&
            isAuthorized === false
        ) {
            navigate("/login", {
                state: {
                    from: location,
                },
            });
        }
    }, [isLoading, location, navigate, isAuthorized]);

    return (
        <AuthContext.Provider
            value={{
                authorized: isAuthorized,
                email: email,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
