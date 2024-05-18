import { useEffect, useState, createContext, useContext } from "react";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import { OAuthProvider, reauthenticateWithPopup } from "firebase/auth";
import { User as FirebaseUser } from "firebase/auth";
import { Loader, Center } from "@mantine/core";

import firebase_app from "@/firebase";

const auth = getAuth(firebase_app);

type AuthContextType = {
  user: FirebaseUser | null;
  signout: () => void;
  setMsToken: (token: string) => void;

  msToken: string | null;
  msId: string | null;
};

export const AuthContext = createContext({
  user: null,
  signout: () => {},
  setMsToken: () => {},
  msToken: null,
  msId: null,
} as AuthContextType);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = (): AuthContextType => useContext(AuthContext);

type ProviderProps = {
  children: React.ReactNode;
};

export const AuthContextProvider = ({ children }: ProviderProps) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [msToken, setMsToken] = useState<string | null>(null);
  const [msId, setMsId] = useState<string | null>(null);

  async function getNewMSToken(user: FirebaseUser) {
    reauthenticateWithPopup(user, new OAuthProvider("microsoft.com"))
      .then((result) => {
        const credential = OAuthProvider.credentialFromResult(result);
        const accessToken = credential?.accessToken;
        if (!accessToken) {
          localStorage.removeItem("mstoken");
          setMsToken(null);
          return;
        }
        localStorage.setItem("mstoken", accessToken);
        setMsToken(accessToken);
      })
      .catch((error: Error) => {
        console.error(error);
        localStorage.removeItem("mstoken");
        setMsToken(null);
      });
    return true;
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        if (checkIfMicrosofUser(user)) await checkIfMicrosoftTokenIsValid(user);
      } else {
        setUser(null);
      }
      setLoading(false);
      function checkIfMicrosofUser(user: FirebaseUser) {
        if (user.providerData[0].providerId === "microsoft.com") {
          return true;
        }
        return false;
      }
      async function checkIfMicrosoftTokenIsValid(user: FirebaseUser) {
        if (user.providerData[0].providerId === "microsoft.com") {
          try {
            const res = await fetch("https://graph.microsoft.com/v1.0/me", {
              headers: {
                Authorization: `Bearer ${msToken}`,
              },
            });
            if (res.status === 401) {
              return await getNewMSToken(user);
            } else {
              const data = await res.json();
              setMsId(data.id);
              return true;
            }
          } catch (error) {
            return false;
          }
        }
      }
    });

    return () => unsubscribe();
  }, [msToken]);

  const signout = async () => {
    localStorage.removeItem("mstoken");
    setMsToken(null);
    await auth.signOut();
  };

  useEffect(() => {
    if (localStorage.getItem("mstoken")) {
      setMsToken(localStorage.getItem("mstoken"));
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: user,
        signout: signout,
        setMsToken: setMsToken,
        msToken: msToken,
        msId: msId,
      }}
    >
      {loading ? (
        <Center h={"100vh"}>
          <Loader />
        </Center>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
