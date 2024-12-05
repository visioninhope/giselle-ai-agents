import * as ToastPrimitive from "@radix-ui/react-toast";
import { useToast } from "../contexts/toast";

export interface Toast {
	title?: string;
	description?: string;
	variant?: "success" | "error" | "warning" | "info";
}

export function Toast(props: Toast) {
	return (
		<>
			<ToastPrimitive.Root className="bg-black-100 rounded-[8px] border border-black-40 py-[8px] px-[16px] backdrop-blur-[67px] grid grid-cols-[auto_max-content] items-center gap-x-[15px] [grid-template-areas:_'title_action'_'description_action'] data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:animate-hide data-[state=open]:animate-slideIn data-[swipe=end]:animate-swipeOut data-[swipe=cancel]:transition-[transform_200ms_ease-out]">
				<ToastPrimitive.Title className="mb-[5px] text-[15px] font-medium text-slate12 [grid-area:_title]">
					Scheduled: Catch up
				</ToastPrimitive.Title>
				<ToastPrimitive.Description asChild>
					<p className=" [grid-area:_description]">hello</p>
				</ToastPrimitive.Description>
			</ToastPrimitive.Root>
		</>
	);
}
