import type { FC, PropsWithChildren } from "react";
import { AddPortProvider, type AddPortProviderProps } from "./add-port";
import {
	DeletePortProvider,
	type DeletePortProviderProps,
} from "./delete-port";
import {
	UpdateNodeProvider,
	type UpdateNodeProviderProps,
} from "./update-node";
import {
	UpdatePortProvider,
	type UpdatePortProviderProps,
} from "./update-port";

type OperationProviderProps = {
	addPort: AddPortProviderProps["addPort"];
	updatePort: UpdatePortProviderProps["updatePort"];
	deletePort: DeletePortProviderProps["deletePort"];
	updateNode: UpdateNodeProviderProps["updateNode"];
};

export const OperationProvider: FC<
	PropsWithChildren<OperationProviderProps>
> = ({ children, addPort, updateNode, deletePort, updatePort }) => {
	return (
		<UpdateNodeProvider updateNode={updateNode}>
			<AddPortProvider addPort={addPort}>
				<UpdatePortProvider updatePort={updatePort}>
					<DeletePortProvider deletePort={deletePort}>
						{children}
					</DeletePortProvider>
				</UpdatePortProvider>
			</AddPortProvider>
		</UpdateNodeProvider>
	);
};
