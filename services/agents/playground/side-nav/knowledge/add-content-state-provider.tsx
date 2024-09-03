import {
	type Dispatch,
	type FC,
	type PropsWithChildren,
	createContext,
	useContext,
	useReducer,
} from "react";

type AddContentState = {
	isAdding: boolean;
};
type AddContentStateContext = {
	isAdding: boolean;
	dispatch: Dispatch<AddContentStateAction>;
};
const AddContentStateContext = createContext<AddContentStateContext | null>(
	null,
);
type AddContentStateAction =
	| {
			type: "ADDING";
	  }
	| {
			type: "ADDED";
	  };

const addContentStateReducer = (
	state: AddContentState,
	action: AddContentStateAction,
): AddContentState => {
	switch (action.type) {
		case "ADDING":
			return { isAdding: true };
		case "ADDED":
			return { isAdding: false };
		default:
			return state;
	}
};

export const AddContentStateProvider: FC<PropsWithChildren> = ({
	children,
}) => {
	const [state, dispatch] = useReducer(addContentStateReducer, {
		isAdding: false,
	});
	console.log(state);
	return (
		<AddContentStateContext.Provider
			value={{ isAdding: state.isAdding, dispatch }}
		>
			{children}
		</AddContentStateContext.Provider>
	);
};

export const useAddContentState = (): AddContentStateContext => {
	const context = useContext(AddContentStateContext);
	if (!context) {
		throw new Error(
			"useAddContentState must be used within a AddContentStateProvider",
		);
	}
	return context;
};
