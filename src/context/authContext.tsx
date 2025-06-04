import { createContext, useContext, useEffect, useState } from "react";
import { useChromeStorage } from "../hooks/useChromeStorage";

type AuthContextType = {
  isOpen: boolean;
};

const AuthContext = createContext<AuthContextType | any>({});

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [geminiAPI, setGeminiAPI] = useState<string | null>(null);
  const [gitToken, setGitToken] = useState<string | null>(null);

  const { getKeyValue, setKey } = useChromeStorage();

  useEffect(() => {
    const loadChromeStorage = async () => {
      if (!chrome) return;

      const geminiTokenPR = await getKeyValue("geminiApi_PR_Review");
      const gitTokenPR = await getKeyValue("gitToken_PR_Review");
      console.log("geminiTokenPR >>>>", geminiTokenPR);
      console.log("gitTokenPR >>>>", gitTokenPR);
      setGeminiAPI(geminiTokenPR);
      setGitToken(gitTokenPR);

      if (!geminiTokenPR || !gitTokenPR) {
        setIsOpen(true);
      }
    };

    loadChromeStorage();
  }, []);

  const handlerToken = async () => {
    await setKey("geminiApi_PR_Review", geminiAPI!);
    await setKey("gitToken_PR_Review", gitToken!);
    setIsOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        isOpen,
        geminiAPI,
        gitToken,
        setIsOpen,
        setGeminiAPI,
        setGitToken,
        handlerToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  return context;
};
