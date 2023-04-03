import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthProvider";

export default function LoginCallback() {
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);

    useEffect(() => {
        if (authContext.authorized) {
            navigate("/", { replace: true })
        }
    }, [authContext.authorized, navigate]);

    return <>Callback</>;
}
