"use client";

import {
	type FC,
	type PropsWithChildren,
	createContext,
	useCallback,
	useState,
} from "react";

type EmailContextType = {
	email: string | null;
	setEmail: (email: string) => void;
};
const EmailContext = createContext<EmailContextType | null>(null);

export const EmailProvider: FC<PropsWithChildren> = ({ children }) => {
	const [emailState, setEmailState] = useState<string | null>(null);
	const setEmail = useCallback((newEmail: string) => {
		setEmailState(newEmail);
	}, []);
	return (
		<EmailContext.Provider value={{ email: emailState, setEmail }}>
			{children}
		</EmailContext.Provider>
	);
};

export const useEmail = () => {
	const context = EmailContext;
	if (!context) {
		throw new Error("useEmail must be used within a EmailProvider");
	}
	return context;
};
