import { redirect } from "next/navigation";

export default function LobyPage() {
	redirect("/agents");
	return <div />;
}
