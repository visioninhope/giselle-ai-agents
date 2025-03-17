import { type ReactNode, createContext, useContext } from "react";
import type { Subscription } from "../schema";

export const SubscriptionContext = createContext<Subscription | undefined>(
	undefined,
);

export function SubscriptionProvider({
	children,
	subscription,
}: { children: ReactNode; subscription?: Subscription }) {
	return (
		<SubscriptionContext.Provider value={subscription}>
			{children}
		</SubscriptionContext.Provider>
	);
}

export const useOptionalSubscription = () => {
	const subscription = useContext(SubscriptionContext);
	return subscription;
};
